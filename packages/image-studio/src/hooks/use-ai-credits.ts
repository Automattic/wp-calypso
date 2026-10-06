import { buildLiveCreditsStatus, parseCreditSnapshot } from '@automattic/agents-manager';
import { useEvent } from '@wordpress/compose';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
	type UpgradeNoticeTrigger,
} from '../utils/tracking';
import type { ImageStudioMode } from '../types';
import type { CreditsStatus } from '@automattic/agents-manager';
import type { AuthProvider, TaskUpdate } from '@automattic/agenttic-client';
import type { NoticeConfig } from '@automattic/agenttic-ui';

/** Balance below which the notice shows, on every paid plan. Matches the Agent's own threshold. */
const SITE_CREDITS_LOW_BALANCE = 20_000;

/** Suggestions wait on the first balance, so a slow endpoint must not hold them back. */
const SITE_CREDITS_TIMEOUT_MS = 5000;

const WPCOM_SITES_API = 'https://public-api.wordpress.com/wpcom/v2/sites';

/** Plans with a higher plan to move to. */
const UPGRADABLE_PLAN_TIERS = [ 'personal', 'premium', 'business' ];

export interface SiteCredits {
	/** False when the site's plan includes no AI credits. */
	hasPlan: boolean;
	remaining: number;
	planTier?: string;
}

function isCount( value: unknown ): value is number {
	return typeof value === 'number' && Number.isSafeInteger( value ) && value >= 0;
}

/**
 * Reads the `ai_credits` snapshot WordPress.com sends for a site on AI credits.
 * Anything unexpected is unknown, never a zero balance.
 */
export function parseSiteCredits( value: unknown, blogId: number ): SiteCredits | null {
	if ( ! value || typeof value !== 'object' ) {
		return null;
	}

	const snapshot = value as Record< string, unknown >;
	const { credits_limit: limit, plan_tier: planTier } = snapshot;
	// Once top-ups ship, `credits_available` adds purchased credits to the plan balance.
	const remaining = snapshot.credits_available ?? snapshot.credits_remaining;
	if ( snapshot.blog_id !== blogId || ! isCount( limit ) || ! isCount( remaining ) ) {
		return null;
	}

	if ( snapshot.reason === 'wpcom_no_plan' && snapshot.eligible === false && limit === 0 ) {
		return { hasPlan: false, remaining };
	}

	if ( snapshot.reason === 'wpcom_site_plan' && snapshot.eligible === true && limit > 0 ) {
		return {
			hasPlan: true,
			remaining,
			...( typeof planTier === 'string' ? { planTier } : {} ),
		};
	}

	return null;
}

export function getSiteCreditsLevel( credits: SiteCredits ): 'none' | 'out' | 'low' | null {
	if ( ! credits.hasPlan ) {
		return 'none';
	}
	if ( credits.remaining === 0 ) {
		return 'out';
	}
	return credits.remaining < SITE_CREDITS_LOW_BALANCE ? 'low' : null;
}

/** Under 1,000 in full; from 1,000 in thousands with one decimal, floored so it never overstates. */
export function formatCreditsLeft( remaining: number ): string {
	if ( remaining < 1000 ) {
		return sprintf(
			/* translators: %s: number of credits left, e.g. "800" */
			__( '%s credits left.', __i18n_text_domain__ ),
			remaining.toLocaleString()
		);
	}
	const thousands = Math.floor( remaining / 100 ) / 10;
	return sprintf(
		/* translators: %s: thousands of credits left, e.g. "8.5" or "67" */
		__( '%sk credits left.', __i18n_text_domain__ ),
		thousands.toLocaleString( undefined, { maximumFractionDigits: 1 } )
	);
}

function getBlogId(): number | null {
	const blogId = Number( window.imageStudioData?.blogId );
	return Number.isSafeInteger( blogId ) && blogId > 0 ? blogId : null;
}

/** Resolves to undefined when the site is not on AI credits or the request fails. */
async function fetchSiteCredits( blogId: number, authProvider: AuthProvider ): Promise< unknown > {
	try {
		const headers = await authProvider();
		const response = await window.fetch( `${ WPCOM_SITES_API }/${ blogId }/ai/credits`, {
			method: 'GET',
			headers,
			cache: 'no-store',
		} );
		// A site that is not on AI credits answers 404.
		if ( ! response.ok ) {
			return undefined;
		}
		const data = await response.json();
		return data?.ai_credits;
	} catch ( error ) {
		window.console?.error?.( '[Image Studio] Failed to fetch site AI credits:', error );
		return undefined;
	}
}

export interface AiCreditsState {
	notice: NoticeConfig | undefined;
	isLimitReached: boolean;
	/** Callers hold suggestions back while true, so chips don't flash before a notice. */
	isLoading: boolean;
	/** For the chat config: a turn's final update carries the new balance. */
	onTaskUpdate: ( update: TaskUpdate ) => void;
	/** The Agent's credits dot, for sites on a paid plan. */
	meter?: { status: CreditsStatus; upgradeUrl?: string };
}

/**
 * Reads the site's AI credit balance when the modal opens and after each turn.
 * @param options              - Hook options
 * @param options.mode         - Image Studio mode ('edit' or 'generate') for tracking
 * @param options.authProvider - The agent's credentials, once its config has loaded
 */
export function useAiCredits( {
	mode,
	authProvider,
}: {
	mode: ImageStudioMode;
	authProvider?: AuthProvider;
} ): AiCreditsState {
	const [ blogId ] = useState( getBlogId );
	const [ balance, setBalance ] = useState< {
		credits: SiteCredits;
		status?: CreditsStatus;
	} | null >( null );
	const [ isLoading, setIsLoading ] = useState( blogId !== null );
	const [ isLowNoticeDismissed, setIsLowNoticeDismissed ] = useState( false );
	const shown = useRef< {
		level: ReturnType< typeof getSiteCreditsLevel >;
		trigger: UpgradeNoticeTrigger;
	} >( { level: null, trigger: 'open' } );

	// An unreadable balance keeps whatever was known, so a fluke never clears or shows a notice.
	const applyCredits = useEvent( ( snapshot: unknown, trigger: UpgradeNoticeTrigger ) => {
		if ( blogId === null ) {
			return;
		}
		const next = parseSiteCredits( snapshot, blogId );
		if ( ! next ) {
			return;
		}
		const level = getSiteCreditsLevel( next );
		if ( level !== shown.current.level ) {
			if ( level ) {
				trackImageStudioUpgradeNoticeShown( { mode, trigger } );
			}
			shown.current = { level, trigger };
		}
		// The ring reads the balance exactly as the Agent's does, so the two always agree.
		const ringSnapshot = parseCreditSnapshot( snapshot, blogId );
		setBalance( {
			credits: next,
			status: ringSnapshot && buildLiveCreditsStatus( ringSnapshot ),
		} );
	} );

	useEffect( () => {
		if ( blogId === null || ! authProvider ) {
			return;
		}

		let isCancelled = false;
		const timeout = setTimeout( () => setIsLoading( false ), SITE_CREDITS_TIMEOUT_MS );

		fetchSiteCredits( blogId, authProvider ).then( ( result ) => {
			if ( isCancelled ) {
				return;
			}
			clearTimeout( timeout );
			setIsLoading( false );
			applyCredits( result, 'open' );
		} );

		return () => {
			isCancelled = true;
			clearTimeout( timeout );
		};
	}, [ blogId, authProvider, applyCredits ] );

	const onTaskUpdate = useEvent( ( update: TaskUpdate ) => {
		if ( update.aiCredits !== undefined ) {
			applyCredits( update.aiCredits, 'refresh' );
		}
	} );

	// Stable object for the memoised chat component.
	return useMemo( () => {
		if ( ! balance ) {
			return { notice: undefined, isLimitReached: false, isLoading, onTaskUpdate };
		}

		const { credits, status } = balance;
		const canUpgrade =
			! credits.hasPlan || UPGRADABLE_PLAN_TIERS.includes( credits.planTier ?? '' );
		const upgradeUrl = canUpgrade
			? `https://wordpress.com/plans/${ blogId }?source=wp_ai_credits`
			: undefined;
		const meter = status && { status, upgradeUrl };

		const level = getSiteCreditsLevel( credits );
		if ( ! level || ( level === 'low' && isLowNoticeDismissed ) ) {
			return { notice: undefined, isLimitReached: false, isLoading, onTaskUpdate, meter };
		}

		const messages = {
			none: __( 'This site’s plan doesn’t include AI credits.', __i18n_text_domain__ ),
			out: __( 'You’ve used all your site credits.', __i18n_text_domain__ ),
			low: formatCreditsLeft( credits.remaining ),
		};

		return {
			isLimitReached: level !== 'low',
			isLoading,
			onTaskUpdate,
			meter,
			notice: {
				message: messages[ level ],
				status: 'warning',
				dismissible: level === 'low',
				...( level === 'low' && { onDismiss: () => setIsLowNoticeDismissed( true ) } ),
				action: upgradeUrl
					? {
							label: __( 'Upgrade', __i18n_text_domain__ ),
							onClick: () => {
								trackImageStudioUpgradeNoticeClick( { mode, trigger: shown.current.trigger } );
								window.open( upgradeUrl, '_blank', 'noopener,noreferrer' );
							},
						}
					: undefined,
			},
		};
	}, [ balance, isLoading, isLowNoticeDismissed, mode, blogId, onTaskUpdate ] );
}
