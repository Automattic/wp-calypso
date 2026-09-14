import apiFetch from '@wordpress/api-fetch';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
} from '../utils/tracking';
import type { ImageStudioMode } from '../types';
import type { NoticeConfig } from '@automattic/agenttic-ui';

/** Mirrors `Image_Usage::LOW_CREDITS_WARNING_THRESHOLD`. */
export const AI_CREDITS_LOW_THRESHOLD = 5;

const UNLIMITED_TIER_VALUE = 1;
const FREE_TIER_VALUE = 0;

export interface AiCredits {
	/** The backend refuses requests until the site upgrades. */
	requireUpgrade: boolean;
	/** Null when unlimited or unknown. */
	remaining: number | null;
	upgradeUrl: string | null;
}

export interface AiAssistantFeatureResponse {
	'site-require-upgrade'?: boolean;
	'requests-count'?: number;
	'requests-limit'?: number;
	'usage-period'?: { 'requests-count'?: number } | null;
	'current-tier'?: { value?: number; limit?: number } | null;
	'upgrade-url'?: string | null;
}

function getRemaining( response: AiAssistantFeatureResponse ): number | null {
	const tierValue = response[ 'current-tier' ]?.value;
	if ( tierValue === UNLIMITED_TIER_VALUE ) {
		return null;
	}

	// The free tier counts all-time usage. Paid tiers reset each period and
	// use the tier's own limit.
	const isFreeTier = tierValue === FREE_TIER_VALUE;
	const count = isFreeTier
		? response[ 'requests-count' ]
		: response[ 'usage-period' ]?.[ 'requests-count' ];
	const limit = isFreeTier
		? response[ 'requests-limit' ]
		: response[ 'current-tier' ]?.limit ?? response[ 'requests-limit' ];

	if ( typeof count !== 'number' || typeof limit !== 'number' ) {
		return null;
	}

	return Math.max( 0, limit - count );
}

export function mapAiAssistantFeatureResponse( response: AiAssistantFeatureResponse ): AiCredits {
	return {
		requireUpgrade: Boolean( response[ 'site-require-upgrade' ] ),
		remaining: getRemaining( response ),
		upgradeUrl: response[ 'upgrade-url' ] || null,
	};
}

export function getAiCreditsNoticeLevel( credits: AiCredits ): 'out' | 'low' | null {
	if ( credits.requireUpgrade ) {
		return 'out';
	}

	// Zero left with no upgrade required is the top tier's soft limit;
	// the backend still serves those requests.
	if (
		credits.remaining !== null &&
		credits.remaining > 0 &&
		credits.remaining <= AI_CREDITS_LOW_THRESHOLD
	) {
		return 'low';
	}

	return null;
}

/** Same endpoint as the Jetpack sidebar's meter: cookie and nonce auth, no JWT. */
const AI_ASSISTANT_FEATURE_PATH = '/wpcom/v2/jetpack-ai/ai-assistant-feature';

/** Suggestions wait on the check, so a slow endpoint must not hold them back. */
const AI_CREDITS_TIMEOUT_MS = 5000;

/** Null on failure: the check must fail open. */
async function fetchAiCredits(): Promise< AiCredits | null > {
	try {
		const response = await apiFetch< AiAssistantFeatureResponse >( {
			path: AI_ASSISTANT_FEATURE_PATH,
		} );
		return mapAiAssistantFeatureResponse( response );
	} catch ( error ) {
		window.console?.error?.( '[Image Studio] Failed to fetch AI credits:', error );
		return null;
	}
}

export interface AiCreditsState {
	notice: NoticeConfig | undefined;
	isLimitReached: boolean;
	/** Callers hold suggestions back while true, so chips don't flash before a notice. */
	isLoading: boolean;
}

/**
 * Checks the site's Jetpack AI credits once, when the modal opens.
 * @param options      - Hook options
 * @param options.mode - Image Studio mode ('edit' or 'generate') for tracking
 */
export function useAiCredits( { mode }: { mode: ImageStudioMode } ): AiCreditsState {
	const [ credits, setCredits ] = useState< AiCredits | null >( null );
	const [ isLoading, setIsLoading ] = useState( true );

	useEffect( () => {
		let isCancelled = false;
		const timeout = setTimeout( () => setIsLoading( false ), AI_CREDITS_TIMEOUT_MS );

		fetchAiCredits().then( ( result ) => {
			if ( isCancelled ) {
				return;
			}
			clearTimeout( timeout );
			setIsLoading( false );
			if ( ! result || ! getAiCreditsNoticeLevel( result ) ) {
				return;
			}
			trackImageStudioUpgradeNoticeShown( { mode, trigger: 'open' } );
			setCredits( result );
		} );

		return () => {
			isCancelled = true;
			clearTimeout( timeout );
		};
		// Once per open: the component remounts each open, and a mode change must not re-run it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	// Stable object for the memoised chat component.
	return useMemo( () => {
		const level = credits ? getAiCreditsNoticeLevel( credits ) : null;
		if ( ! credits || ! level ) {
			return { notice: undefined, isLimitReached: false, isLoading };
		}

		const { upgradeUrl } = credits;
		const isLow = level === 'low';

		return {
			isLimitReached: ! isLow,
			isLoading,
			notice: {
				// Same copy as the backend's low-credits notice.
				message: isLow
					? __( 'Almost at your limit. Upgrade anytime to keep creating.', __i18n_text_domain__ )
					: __(
							"You've reached your AI requests limit. Upgrade to keep creating.",
							__i18n_text_domain__
					  ),
				status: 'warning',
				dismissible: isLow,
				onDismiss: isLow ? () => setCredits( null ) : undefined,
				action: upgradeUrl
					? {
							label: __( 'Upgrade plan', __i18n_text_domain__ ),
							onClick: () => {
								trackImageStudioUpgradeNoticeClick( { mode, trigger: 'open' } );
								window.open( upgradeUrl, '_blank', 'noopener,noreferrer' );
							},
					  }
					: undefined,
			},
		};
	}, [ credits, isLoading, mode ] );
}
