import apiFetch from '@wordpress/api-fetch';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
	type UpgradeNoticeTrigger,
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
 * Checks the site's Jetpack AI credits when the modal opens, and again after
 * each turn so a session that uses them up still sees the notice.
 * @param options              - Hook options
 * @param options.mode         - Image Studio mode ('edit' or 'generate') for tracking
 * @param options.isProcessing - True while a turn runs; each turn's end re-checks
 */
export function useAiCredits( {
	mode,
	isProcessing,
}: {
	mode: ImageStudioMode;
	isProcessing: boolean;
} ): AiCreditsState {
	const [ credits, setCredits ] = useState< AiCredits | null >( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const shown = useRef< { level: 'out' | 'low' | null; trigger: UpgradeNoticeTrigger } >( {
		level: null,
		trigger: 'open',
	} );
	const wasProcessing = useRef( isProcessing );

	// A failed check keeps whatever was known, so a fluke never clears or shows a notice.
	const applyResult = ( result: AiCredits | null, trigger: UpgradeNoticeTrigger ) => {
		if ( ! result ) {
			return;
		}
		const level = getAiCreditsNoticeLevel( result );
		if ( level && level !== shown.current.level ) {
			trackImageStudioUpgradeNoticeShown( { mode, trigger } );
		}
		shown.current = { level, trigger };
		setCredits( level ? result : null );
	};

	useEffect( () => {
		let isCancelled = false;
		const timeout = setTimeout( () => setIsLoading( false ), AI_CREDITS_TIMEOUT_MS );

		fetchAiCredits().then( ( result ) => {
			if ( isCancelled ) {
				return;
			}
			clearTimeout( timeout );
			setIsLoading( false );
			applyResult( result, 'open' );
		} );

		return () => {
			isCancelled = true;
			clearTimeout( timeout );
		};
		// Once per open: the component remounts each open, and a mode change must not re-run it.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useEffect( () => {
		const turnEnded = wasProcessing.current && ! isProcessing;
		wasProcessing.current = isProcessing;
		if ( ! turnEnded ) {
			return;
		}

		let isCancelled = false;
		fetchAiCredits().then( ( result ) => {
			if ( ! isCancelled ) {
				applyResult( result, 'refresh' );
			}
		} );

		return () => {
			isCancelled = true;
		};
		// Only the end of a turn re-checks; a mode change must not.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isProcessing ] );

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
				message: isLow
					? __( "You're almost out of free credits.", __i18n_text_domain__ )
					: __( "You're out of free credits.", __i18n_text_domain__ ),
				status: 'warning',
				dismissible: false,
				action: upgradeUrl
					? {
							label: __( 'Upgrade plan', __i18n_text_domain__ ),
							onClick: () => {
								trackImageStudioUpgradeNoticeClick( { mode, trigger: shown.current.trigger } );
								window.open( upgradeUrl, '_blank', 'noopener,noreferrer' );
							},
					  }
					: undefined,
			},
		};
	}, [ credits, isLoading, mode ] );
}
