import Fastify from "fastify";
import { MongoClient } from "mongodb";
import FastifyStatic from "@fastify/static";
import path from "path";
import Pets from "./pets.js";

const URL = "mongodb://localhost:27017";
const DB_NAME = "adoptions";

const app = Fastify({ logger: true });
const client = new MongoClient(URL);

// Register a plugin to connect to MongoDB
app.register(async (fastify) => {
  await client.connect();
  const db = client.db(DB_NAME);
  fastify.decorate("db", db);

  app.register(FastifyStatic, {
    root: path.join(path.resolve(), "public"),
    prefix: "/public/",
  });

  app.register(Pets);
});

app.listen({ port: 5000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
