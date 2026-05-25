import neo4j from "neo4j-driver";
import "dotenv/config";

if (!process.env.NEO4J_URI) console.error("❌ Missing NEO4J_URI");
if (!process.env.NEO4J_USER) console.error("❌ Missing NEO4J_USER");
if (!process.env.NEO4J_PASSWORD) console.error("❌ Missing NEO4J_PASSWORD");

export const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

export async function runCypher(query, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(query, params);
    return result.records.map(r => r.toObject());
  } finally {
    await session.close();
  }
}
