/**
 * Tracks props for the site credits notice, its dismissal and the credits popover.
 */
import { type CreditsStatus, isCreditsExhausted, isCreditsLow } from './credits';
import { recordAgentsManagerTracksEvent } from './tracks';
import type { ContextProvider, TaskUpdate } from '@automattic/agenttic-client';

export type CreditsState = 'ok' | 'low' | 'zero';

export type CreditsTracksEventName =
	| 'calypso_agents_manager_credits_notice_shown'
	| 'calypso_agents_manager_credits_notice_dismissed'
	| 'calypso_agents_manager_credits_meter_opened';

/** By the same rules as the dot and the notices, so it follows `CREDITS_LOW_BALANCE`. */
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

/** The call to action the notice shows: the Upgrade link, or who to ask. */
export function getCreditsCtaType(
	hasUpgradeLink: boolean,
	askToUpgrade?: 'site-admin' | 'plan-owner'
): 'upgrade' | 'contact_admin' | 'contact_plan_owner' | 'none' {
	if ( hasUpgradeLink ) {
		return 'upgrade';
	}
	if ( askToUpgrade === 'site-admin' ) {
		return 'contact_admin';
	}
	if ( askToUpgrade === 'plan-owner' ) {
		return 'contact_plan_owner';
	}

	return 'none';
}

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

/** The client context's `environment`, sent unchanged as the server's credit events do. */
function getAgentEnvironment( contextProvider?: ContextProvider ): string {
	try {
		const environment = contextProvider?.getClientContext().environment;
		return typeof environment === 'string' && environment !== '' ? environment : 'none';
	} catch {
		return 'none';
	}
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
		plan_tier: status.planTier ?? 'none',
		...props,
	} );
}
