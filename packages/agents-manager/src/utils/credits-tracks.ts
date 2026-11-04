/**
 * Tracks props for the site credits notice, its dismissal, the credits popover and their Upgrade and Add credits clicks,
 * and the refusal codes a failed reply carries.
 */
import {
	type CreditsStatus,
	getAgentEnvironment,
	getTopUpCreditsLeft,
	isCreditsExhausted,
	isCreditsLow,
} from './credits';
import { recordAgentsManagerTracksEvent } from './tracks';
import type { ContextProvider, TaskUpdate } from '@automattic/agenttic-client';

export type CreditsState = 'ok' | 'low' | 'zero';

export type CreditsTracksEventName =
	| 'calypso_agents_manager_credits_notice_shown'
	| 'calypso_agents_manager_credits_notice_dismissed'
	| 'calypso_agents_manager_credits_meter_opened'
	| 'calypso_agents_manager_credits_cta_clicked';

/** By the same rules as the meter and the notices, so it follows `CREDITS_LOW_BALANCE`. */
export function getCreditsState( status: CreditsStatus ): CreditsState {
	if ( isCreditsExhausted( status ) ) {
		return 'zero';
	}

	return isCreditsLow( status ) ? 'low' : 'ok';
}

/** Any site admin can buy credits; `none` when the balance read didn't say. */
export function getCreditsUserRole( canBuyCredits?: boolean ): 'admin' | 'non_admin' | 'none' {
	if ( canBuyCredits === undefined ) {
		return 'none';
	}

	return canBuyCredits ? 'admin' : 'non_admin';
}

/** Every site credits refusal's code starts with this. */
export const CREDITS_REFUSAL_PREFIX = 'ai_credit_allowance_';

/** The site has used all its credits; the only refusal the chat offers a purchase for. */
export const CREDITS_EXHAUSTED_REFUSAL = 'ai_credit_allowance_exhausted';

/**
 * The code a failed reply carries in its data part, such as
 * `ai_credit_allowance_exhausted`. The chat's error only gets the reply's text.
 */
export function getTaskRefusalCode( update: TaskUpdate ): string | undefined {
	if ( update.status.state !== 'failed' ) {
		return undefined;
	}

	for ( const part of update.status.message?.parts ?? [] ) {
		const code = part.type === 'data' ? ( part.data as { code?: unknown } )?.code : undefined;
		if ( typeof code === 'string' && code !== '' ) {
			return code;
		}
	}

	return undefined;
}

/** WordPress.com sets `_currentSiteType` on editor pages only, so other surfaces send `none`. */
function getSiteType(): string {
	const siteType = window._currentSiteType;
	return typeof siteType === 'string' && siteType !== '' ? siteType : 'none';
}

export function recordCreditsTracksEvent(
	eventName: CreditsTracksEventName,
	{
		status,
		siteId,
		contextProvider,
	}: { status: CreditsStatus; siteId: number; contextProvider?: ContextProvider },
	props: Record< string, string > = {}
): void {
	recordAgentsManagerTracksEvent( eventName, {
		blog_id: siteId,
		site_type: getSiteType(),
		agent_environment: getAgentEnvironment( contextProvider ),
		state: getCreditsState( status ),
		credits_left: status.remaining ?? 'none',
		top_up_credits_left: getTopUpCreditsLeft( status ),
		plan_tier: status.planTier ?? 'none',
		...props,
	} );
}
