import {
	CREDITS_LOW_BALANCE,
	CREDITS_UPGRADE_SOURCE,
	formatCreditsShort,
	getCreditsUpgradeUrl,
	parseLiveCreditsStatus,
} from '@automattic/agents-manager';
import { useEvent } from '@wordpress/compose';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import {
	getImageStudioBlogId,
	getImageStudioSiteType,
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
	type UpgradeNoticeCredits,
	type UpgradeNoticeTrigger,
} from '../utils/tracking';
import type { ImageStudioMode } from '../types';
import type { CreditsStatus } from '@automattic/agents-manager';
import type { AuthProvider, TaskState, TaskUpdate } from '@automattic/agenttic-client';
import type { NoticeConfig } from '@automattic/agenttic-ui';

/** Suggestions wait on the first balance, so a slow endpoint must not hold them back. */
const SITE_CREDITS_TIMEOUT_MS = 5000;

const WPCOM_SITES_API = 'https://public-api.wordpress.com/wpcom/v2/sites';

const TURN_END_STATES: TaskState[] = [ 'completed', 'failed', 'canceled' ];

type PaidCreditsStatus = Extract< CreditsStatus, { plan: 'paid' } >;

type SiteCreditsLevel = 'out' | 'low';

export function getSiteCreditsLevel( remaining: number ): SiteCreditsLevel | null {
	if ( remaining === 0 ) {
		return 'out';
	}
	return remaining < CREDITS_LOW_BALANCE ? 'low' : null;
}

function getNoticeMessage( level: SiteCreditsLevel, remaining: number ): string {
	if ( level === 'out' ) {
		return __( 'You’ve used all your site credits.', __i18n_text_domain__ );
	}
	return sprintf(
		/* translators: %s: site credits left in short form, e.g. "800" or "8.5k" */
		_n( '%s credit left.', '%s credits left.', remaining, __i18n_text_domain__ ),
		formatCreditsShort( remaining )
	);
}

function getNoticeCredits(
	status: PaidCreditsStatus,
	level: SiteCreditsLevel,
	upgradeUrl: string | undefined
): UpgradeNoticeCredits {
	return {
		meter: 'site_credits',
		state: level === 'out' ? 'zero' : 'low',
		planTier: status.planTier ?? 'none',
		creditsLeft: status.remaining,
		ctaType: upgradeUrl ? 'upgrade' : 'none',
		ref: upgradeUrl ? CREDITS_UPGRADE_SOURCE : 'none',
	};
}

/** Only Simple and Atomic sites can be on AI credits, so self-hosted sites skip the check. */
function getSiteCreditsBlogId(): number | null {
	return getImageStudioSiteType() === 'jetpack' ? null : getImageStudioBlogId();
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
	/** Out of credits. Callers hide suggestions, which cost credits to load. */
	isLimitReached: boolean;
	/** Callers hold suggestions back while true, so chips don't flash before a notice. */
	isLoading: boolean;
	/** For the chat config: a turn's final update carries the new balance. */
	onTaskUpdate: ( update: TaskUpdate ) => void;
	/** For the chat container: at zero, blocks Send and opens the dot's details, keeping the draft. */
	beforeSubmit: () => boolean;
	/** The Agent's credits dot, for sites on a paid plan. */
	meter?: {
		status: CreditsStatus;
		upgradeUrl?: string;
		isOpen: boolean;
		onToggle: ( isOpen: boolean ) => void;
	};
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
	const [ blogId ] = useState( getSiteCreditsBlogId );
	const [ status, setStatus ] = useState< PaidCreditsStatus | null >( null );
	const [ isLoading, setIsLoading ] = useState( blogId !== null );
	const [ isLowNoticeDismissed, setIsLowNoticeDismissed ] = useState( false );
	const [ isMeterOpen, setIsMeterOpen ] = useState( false );
	const turnBalanceCount = useRef( 0 );
	const shown = useRef< { level: SiteCreditsLevel | null; trigger: UpgradeNoticeTrigger } >( {
		level: null,
		trigger: 'open',
	} );

	// The Agent's parser, so the notice, the send block and the dot always agree. An unreadable
	// balance keeps whatever was known, so a fluke never clears or shows a notice.
	const applyCredits = useEvent( ( snapshot: unknown, trigger: UpgradeNoticeTrigger ) => {
		if ( blogId === null ) {
			return false;
		}
		const next = parseLiveCreditsStatus( snapshot, blogId );
		if ( next?.plan !== 'paid' ) {
			return false;
		}
		const level = getSiteCreditsLevel( next.remaining );
		// A known balance running out opens the dot's details once. The first read stays quiet.
		if ( level === 'out' && status && getSiteCreditsLevel( status.remaining ) !== 'out' ) {
			setIsMeterOpen( true );
		}
		if ( level !== shown.current.level ) {
			if ( level ) {
				const credits = getNoticeCredits( next, level, getCreditsUpgradeUrl( next, blogId ) );
				trackImageStudioUpgradeNoticeShown( { mode, trigger, ...credits } );
			}
			shown.current = { level, trigger };
		}
		setStatus( next );
		return true;
	} );

	useEffect( () => {
		if ( blogId === null || ! authProvider ) {
			return;
		}

		let isCancelled = false;
		const turnBalancesBefore = turnBalanceCount.current;
		const timeout = setTimeout( () => setIsLoading( false ), SITE_CREDITS_TIMEOUT_MS );

		fetchSiteCredits( blogId, authProvider ).then( ( result ) => {
			if ( isCancelled ) {
				return;
			}
			clearTimeout( timeout );
			setIsLoading( false );
			// A turn that finished while this check ran already reported a newer balance.
			if ( turnBalanceCount.current === turnBalancesBefore ) {
				applyCredits( result, 'open' );
			}
		} );

		return () => {
			isCancelled = true;
			clearTimeout( timeout );
		};
	}, [ blogId, authProvider, applyCredits ] );

	// Only a turn's last update has its final balance.
	const onTaskUpdate = useEvent( ( update: TaskUpdate ) => {
		const isTurnEnd = update.final ?? TURN_END_STATES.includes( update.status.state );
		if ( isTurnEnd && applyCredits( update.aiCredits, 'refresh' ) ) {
			turnBalanceCount.current++;
		}
	} );

	const level = status ? getSiteCreditsLevel( status.remaining ) : null;
	const upgradeUrl = status && blogId !== null ? getCreditsUpgradeUrl( status, blogId ) : undefined;
	const isNoticeHidden = level === 'low' && isLowNoticeDismissed;

	const beforeSubmit = useEvent( () => {
		if ( level !== 'out' ) {
			return true;
		}
		setIsMeterOpen( true );
		return false;
	} );

	// Memoised so the memoised chat doesn't re-render whenever the modal does.
	return useMemo(
		() => ( {
			isLimitReached: level === 'out',
			isLoading,
			onTaskUpdate,
			beforeSubmit,
			meter: status
				? { status, upgradeUrl, isOpen: isMeterOpen, onToggle: setIsMeterOpen }
				: undefined,
			notice:
				status && level && ! isNoticeHidden
					? {
							icon: false,
							message: getNoticeMessage( level, status.remaining ),
							dismissible: level === 'low',
							onDismiss: () => setIsLowNoticeDismissed( true ),
							action: upgradeUrl
								? {
										label: __( 'Upgrade', __i18n_text_domain__ ),
										href: upgradeUrl,
										target: '_blank',
										rel: 'noopener noreferrer',
										onClick: () =>
											trackImageStudioUpgradeNoticeClick( {
												mode,
												trigger: shown.current.trigger,
												...getNoticeCredits( status, level, upgradeUrl ),
											} ),
									}
								: undefined,
						}
					: undefined,
		} ),
		[
			status,
			level,
			upgradeUrl,
			isNoticeHidden,
			isMeterOpen,
			isLoading,
			mode,
			onTaskUpdate,
			beforeSubmit,
		]
	);
}
