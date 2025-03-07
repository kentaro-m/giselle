"use server";

import { redirect } from "next/navigation";
import invariant from "tiny-invariant";
import { UPGRADING_TEAM_DB_ID_KEY } from "../constants";
import type { CurrentTeam } from "../types";
import { createCheckoutSession } from "./create-checkout-session";

export async function upgradeTeam(team: CurrentTeam) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
	invariant(siteUrl, "NEXT_PUBLIC_SITE_URL is not set");

	const successUrl = `${siteUrl}/settings/team`;
	const cancelUrl = successUrl;

	const subscriptionMetadata: Record<string, string> = {
		[UPGRADING_TEAM_DB_ID_KEY]: team.dbId.toString(),
	};

	const checkoutSession = await createCheckoutSession(
		subscriptionMetadata,
		successUrl,
		cancelUrl,
	);
	redirect(checkoutSession.url);
}
