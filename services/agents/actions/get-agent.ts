"use server";

import { agents, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import type { AgentId } from "../types";

type GetAgentsArgs = {
	teamDbId: number;
};

type TagParams = {
	teamDbId: number;
};

const getAgentsTag = (params: TagParams) => `${params.teamDbId}.getAgents`;

/**
 * Currently this function is not in use, but if it will be used client-side,
 * we should modify it to accept teamId instead of teamDbId and retrieve teamDbId
 * within the function to avoid exposing internal database IDs.
 *
 * ref: https://github.com/giselles-ai/giselle/pull/300
 */
export const getAgents = async (args: GetAgentsArgs) => {
	const cachedAgents = unstable_cache(
		async () => {
			const result = await db
				.select({ agents })
				.from(agents)
				.where(eq(agents.teamDbId, args.teamDbId));

			return result.map((row) => row.agents);
		},
		[args.teamDbId.toString()],
		{ tags: [getAgentsTag(args)] },
	);
	return await cachedAgents();
};

export const revalidateGetAgents = async (params: TagParams) => {
	revalidateTag(getAgentsTag(params));
};

export const getAgent = async (args: { agentId: AgentId }) => {
	const agent = await db.query.agents.findFirst({
		where: eq(agents.id, args.agentId),
	});
	if (agent == null) {
		throw new Error(`Agent not found: ${args.agentId}`);
	}
	return agent;
};
