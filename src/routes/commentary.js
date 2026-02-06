import { Router } from "express";
import { createCommentarySchema, listCommentaryQuerySchema } from "../validation/commentary.js";
import { matchIdParamSchema } from "../validation/matches.js";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { desc, eq } from "drizzle-orm";

const MAX_LIMIT = 100;

export const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get("/", async (req, res) => {

    const paramsParsed = matchIdParamSchema.safeParse(req.params);

    if(!paramsParsed.success) {
        return res.status(400).json({ error: "Invalid Match Id", details: paramsParsed.error.issues });
    }

    const queryParsed = listCommentaryQuerySchema.safeParse(req.query);

    if(!queryParsed.success) {
        return res.status(400).json({ error: "Invalid Query Parameters", details: queryParsed.error.issues });
    }


    try {

        const { id: matchId } = paramsParsed.data;
        const { limit = 10, offset } = queryParsed.data;

        const safeLimit = Math.min(limit, MAX_LIMIT);

        const result = await db
                            .select()
                            .from(commentary)
                            .where(eq(commentary.matchId, matchId))
                            .orderBy(desc(commentary.createdAt))
                            .limit(safeLimit);

        if (!result) {
            console.error("Failed to get commentary");
            return res.status(500).json({ error: "Failed to get commentary" });
        }

        return res.status(200).json({ data: result });

        
    } catch (error) {
        console.error("Failed to get commentary", error);
        return res.status(500).json({ error: "Failed to get commentary" });
    }

})


commentaryRouter.post("/", async (req, res) => {

    const paramsParsed = matchIdParamSchema.safeParse(req.params);

    if(!paramsParsed.success) {
        return res.status(400).json({ error: "Invalid Match Id", details: paramsParsed.error.issues });
    }

    const bodyParsed = createCommentarySchema.safeParse(req.body);

    if(!bodyParsed.success) {
        return res.status(400).json({ error: "Invalid Commentary Payload", details: bodyParsed.error.issues });
    }

    try {

        const { ...rest } = bodyParsed.data;
        const [result] = await db.insert(commentary).values({
            matchId: paramsParsed.data.id,
            ...rest
        }).returning();

        if (!result) {
            console.error("Failed to create commentary");
            return res.status(500).json({ error: "Failed to create commentary" });
        }

        if(res.app.locals.broadcastCommentary) {
            res.app.locals.broadcastCommentary(result.matchId, result);
        }

        return res.status(200).json({ data: result });

        
    } catch (error) {
        console.error("Failed to create commentary", error);
        return res.status(500).json({ error: "Failed to create commentary" });
    }

})


