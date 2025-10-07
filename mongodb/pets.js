import { ObjectId } from "mongodb";

const COLLECTION_NAME = "pets";

export default async function (fastify, opts) {
  fastify.get("/list", async (request, reply) => {
    return reply.sendFile("list.html");
  });

  fastify.get("/search", async (request, reply) => {
    return reply.sendFile("search_delete.html");
  });

  fastify.get("/pets", async (request, reply) => {
    try {
      const pets = await fastify.db
        .collection(COLLECTION_NAME)
        .find()
        .toArray();
      reply.send(pets);
    } catch (err) {
      fastify.log.error("Failed to fetch pets", err);
      reply.status(500).send({ error: "Failed to fetch pets" });
    }
  });

  fastify.get("/pets/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      const pet = await fastify.db
        .collection(COLLECTION_NAME)
        .findOne({ _id: new ObjectId(id) });
      if (!pet) {
        return reply.status(404).send({ error: "Pet not found" });
      }
      reply.send(pet);
    } catch (err) {
      fastify.log.error("Failed to fetch pet", err);
      reply.status(500).send({ error: "Failed to fetch pet" });
    }
  });

  fastify.delete("/pets/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      const result = await fastify.db
        .collection(COLLECTION_NAME)
        .deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return reply.status(404).send({ error: "Pet not found" });
      }
      reply.send({ message: "Pet deleted successfully" });
    } catch (err) {
      fastify.log.error("Failed to delete pet", err);
      reply.status(500).send({ error: "Failed to delete pet" });
    }
  });
}
