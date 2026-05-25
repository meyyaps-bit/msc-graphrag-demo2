import { runCypher } from "./neo4j.js";
import { askLLM } from "./claude.js";

export async function graphRAG(question) {
  const cypherPrompt = `
You are an expert Neo4j Cypher generator.

Use ONLY the graph schema below.
Never invent new labels, properties, or relationship types.
Return ONLY Cypher.

GRAPH SCHEMA
------------
Nodes:
- Programme {name}
- Module {name}
- Staff {name, role}

Relationships:
- (Programme)-[:HAS_MODULE]->(Module)
- (Module)-[:TAUGHT_BY]->(Staff)
- (Programme)-[:LED_BY]->(Staff)

RULES
-----
1. "MSc" means Programme {name: "MSc Data & AI"}
2. Use EXACT labels and relationship types.
3. If unsure, return:
   MATCH (n) WHERE false RETURN n

USER QUESTION:
"${question}"
`;

  let raw = await askLLM(cypherPrompt);
  if (!raw) raw = "MATCH (n) WHERE false RETURN n";

  const cypher = raw.replace(/```/g, "").trim();
  console.log("Generated Cypher:", cypher);

  let data = [];
  try {
    data = await runCypher(cypher);
  } catch (err) {
    console.error("Cypher error:", err);
  }

  const answerPrompt = `
User question:
${question}

Graph data:
${JSON.stringify(data, null, 2)}

Answer using ONLY this data.
If empty, say:
"I don't have enough information in the graph to answer that."
`;

  return await askLLM(answerPrompt);
}
