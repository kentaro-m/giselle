import "@xyflow/react/dist/style.css";
import { getTeamMembershipByAgentId } from "@/app/(auth)/lib/get-team-membership-by-agent-id";
import { agents, db } from "@/drizzle";
import {
	uploadFileToPromptNodeFlag as getUploadFileToPromptNodeFlag,
	webSearchNodeFlag as getWebSearchNodeFlag,
} from "@/flags";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Playground } from "./beta-proto/component";
import type { AgentId } from "./beta-proto/types";

async function getAgent(agentId: AgentId) {
	const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
	return agent;
}

export default async function AgentPlaygroundPage({
	params,
}: {
	params: Promise<{ agentId: AgentId }>;
}) {
	const { agentId } = await params;
	const user = await getUser();

	const teamMembership = await getTeamMembershipByAgentId(agentId, user.id);

	if (!teamMembership) {
		notFound();
	}

	const uploadFileToPromptNodeFlag = await getUploadFileToPromptNodeFlag();
	const webSearchNodeFlag = await getWebSearchNodeFlag();

	const agent = await getAgent(agentId);

	return (
		<Playground
			agentId={agentId}
			graph={agent.graphv2}
			featureFlags={{ uploadFileToPromptNodeFlag, webSearchNodeFlag }}
		/>
	);
}