import Fastify from "fastify";
import FastifyStatic from "@fastify/static";
import pg from "pg";
import path from "path";

const app = Fastify({ logger: true });

const __dirname = path.resolve();

// PostgreSQL client setup
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "message_boards",
  password: "mysecretpassword",
  port: 5432,
});

app.register(FastifyStatic, {
  root: path.join(__dirname, "./public"),
  prefix: "/public/",
});

app.get("/list", async (request, reply) => {
  return reply.sendFile("list.html");
});

app.get("/search", async (request, reply) => {
  return reply.sendFile("search_delete.html");
});

app.get("/boards", async (request, reply) => {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM boards");
    return res.rows;
  } catch (err) {
    app.log.error(err);
    reply.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

app.get("/boards/:id", async (request, reply) => {
  const client = await pool.connect();
  const { id } = request.params;
  try {
    const res = await client.query("SELECT * FROM boards WHERE board_id = $1", [
      id,
    ]);
    if (res.rows.length === 0) {
      reply.status(404).send("Board not found");
    }
    return res.rows[0];
  } catch (err) {
    app.log.error(err);
    reply.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

app.delete("/boards/:id", async (request, reply) => {
  const client = await pool.connect();
  const { id } = request.params;
  try {
    const res = await client.query("DELETE FROM boards WHERE board_id = $1", [
      id,
    ]);

    if (res.rowCount === 0) {
      reply.status(404).send({ message: "Board not found" });
    } else {
      reply.status(200).send({ message: "Board deleted successfully" });
    }
  } catch (err) {
    app.log.error(err);
    reply.status(500).send({ message: "Internal Server Error" });
  } finally {
    client.release();
  }
});

app.listen({ port: 5000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
