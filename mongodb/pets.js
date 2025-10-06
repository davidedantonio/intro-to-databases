const COLLECTION_NAME = "pets";

export default async function (fastify, opts) {
  fastify.get("/list", async (request, reply) => {
    return reply.sendFile("list.html");
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
}
