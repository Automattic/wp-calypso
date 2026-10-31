import {
	CREDITS_LOW_BALANCE,
	CREDITS_UPGRADE_SOURCE,
	getCreditsCtaType,
	getCreditsNoticeMessage,
	getCreditsPurchaseAction,
	getCreditsPurchaseLink,
	getCreditsPurchaseOptions,
	getTopUpCreditsLeft,
	parseCreditsAccess,
	parseLiveCreditsStatus,
} from '@automattic/agents-manager';
import { useEvent } from '@wordpress/compose';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { getSessionId } from '../utils/session';
import {
	getImageStudioBlogId,
	getImageStudioIsMetered,
	getImageStudioSiteType,
	trackImageStudioCreditsMeterOpened,
	trackImageStudioUpgradeNoticeShown,
	trackImageStudioUpgradeNoticeClick,
	type CreditsMeterDetails,
	type CreditsMeterOpenedTrigger,
	type UpgradeLinkTrigger,
	type UpgradeNoticeCredits,
	type UpgradeNoticeTrigger,
} from '../utils/tracking';
import type { ImageStudioMode } from '../types';
import type {
	CreditsAccess,
	CreditsPurchaseAction,
	CreditsPurchaseOptions,
	CreditsStatus,
} from '@automattic/agents-manager';
import type { AuthProvider, TaskState, TaskUpdate } from '@automattic/agenttic-client';
import type { NoticeConfig } from '@automattic/agenttic-ui';

/** Suggestions wait on the first balance, so a slow endpoint must not hold them back. */
const SITE_CREDITS_TIMEOUT_MS = 5000;

/** A failed check is tried again after each of these, so a metered site doesn't look unmetered. */
const RETRY_DELAYS_MS = [ 2000, 5000, 15000 ];

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

const CREDITS_STATE_BY_LEVEL = { out: 'zero', low: 'low' } as const;

function getMeterDetails(
	status: PaidCreditsStatus,
	level: SiteCreditsLevel | null
): CreditsMeterDetails {
	return {
		meter: 'site_credits',
		state: level ? CREDITS_STATE_BY_LEVEL[ level ] : 'ok',
		planTier: status.planTier ?? 'none',
		creditsLeft: status.remaining,
		topUpCreditsLeft: getTopUpCreditsLeft( status ),
	};
}

function getNoticeCredits(
	status: PaidCreditsStatus,
	level: SiteCreditsLevel | null,
	{ purchaseKind, askToUpgrade }: CreditsPurchaseOptions
): UpgradeNoticeCredits {
	return {
		...getMeterDetails( status, level ),
		ctaType: getCreditsCtaType( purchaseKind, askToUpgrade ),
		ref: purchaseKind ? CREDITS_UPGRADE_SOURCE : 'none',
	};
}

/** Only Simple and Atomic sites can be on AI credits, so self-hosted sites skip the check. */
function getSiteCreditsBlogId(): number | null {
	return getImageStudioSiteType() === 'jetpack' ? null : getImageStudioBlogId();
}

/** The link carries the session the click event sends as `ai_session_id`. */
function getSitePurchaseLink( status: PaidCreditsStatus, blogId: number ) {
	return getCreditsPurchaseLink(
		status,
		blogId,
		getImageStudioSiteType() === 'simple',
		getSessionId()
	);
}

/**
 * Resolves to undefined when the site is not on AI credits or the request is aborted, and to
 * null when the request fails in a way that may pass, as a 5xx or a network error does.
 */
async function fetchSiteCredits(
	blogId: number,
	authProvider: AuthProvider,
	signal: AbortSignal
): Promise< { aiCredits: unknown; access: CreditsAccess } | null | undefined > {
	try {
		const headers = await authProvider();
		const response = await window.fetch( `${ WPCOM_SITES_API }/${ blogId }/ai/credits`, {
			method: 'GET',
			headers,
			cache: 'no-store',
			signal,
		} );
		// A site that is not on AI credits answers 404.
		if ( ! response.ok ) {
			return response.status >= 500 ? null : undefined;
		}
		const data = await response.json();
		return { aiCredits: data?.ai_credits, access: parseCreditsAccess( data ) };
	} catch ( error ) {
		// An abort means the modal closed or its credentials changed, not that the request failed.
		if ( ! signal.aborted ) {
			window.console?.error?.( '[Image Studio] Failed to fetch site AI credits:', error );
			return null;
		}
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
	/** For the chat container: at zero, blocks Send and opens the meter's details, keeping the draft. */
	beforeSubmit: () => boolean;
	/** The Agent's credits meter, for sites on a paid plan. */
	meter?: {
		status: CreditsStatus;
		/** Upgrade or Add credits, by the site's plan. Its click joins the notice's events. */
		action?: CreditsPurchaseAction;
		/** Shown instead of that button to people who can't buy it. */
		purchaseHint?: string;
		isOpen: boolean;
		onToggle: ( isOpen: boolean ) => void;
	};
}

/**
 * Reads the site's AI credit balance when the modal opens, and again when the page regains
 * focus or comes back online, as after buying credits in checkout's tab; each turn's final
 * update brings the next one. Only one read runs at a time. Pages the host says aren't
 * metered don't ask; a turn's balance still shows. A 404 means the site isn't on AI credits.
 * A 5xx or a network error is tried again a few times.
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
	// An absent value asks the endpoint, since an Atomic site's PHP can't tell.
	const [ isRequestSkipped ] = useState( () => getImageStudioIsMetered() === false );
	const [ status, setStatus ] = useState< PaidCreditsStatus | null >( null );
	const [ isLoading, setIsLoading ] = useState( blogId !== null && ! isRequestSkipped );
	const [ isLowNoticeDismissed, setIsLowNoticeDismissed ] = useState( false );
	const [ isMeterOpen, setIsMeterOpen ] = useState( false );
	// Only a credits check says who may buy; a turn's balance doesn't.
	const [ access, setAccess ] = useState< CreditsAccess >();
	const accessRef = useRef< CreditsAccess | undefined >( undefined );
	const canCheck = blogId !== null && ! isRequestSkipped && !! authProvider;
	// Cancelled when the credentials change or the modal closes, so an older check's answer is dropped.
	const checkToken = useRef( { isCancelled: false } );
	const retry = useRef< { attempt: number; timer?: ReturnType< typeof setTimeout > } >( {
		attempt: 0,
	} );
	// The check in flight, aborted when its token is cancelled. Returning to the page fires focus
	// and visibilitychange together, so another check doesn't start while one runs.
	const runningCheck = useRef< AbortController | undefined >( undefined );
	// A notice event waits for a running check to answer or fail, so it can say whether
	// Upgrade or Add credits shows; a skipped check leaves nothing to wait for. The opening
	// check's 5-second timeout doesn't count: a late answer can still add the button.
	const isAccessSettled = useRef( isRequestSkipped );
	const heldNotice = useRef< { level: SiteCreditsLevel; trigger: UpgradeNoticeTrigger } | null >(
		null
	);
	const latestStatus = useRef< PaidCreditsStatus | null >( null );
	const turnBalanceCount = useRef( 0 );
	// `undefined` until a balance is known. Updated as each balance arrives, so two in one render
	// still compare with each other.
	const shown = useRef< {
		level: SiteCreditsLevel | null | undefined;
		trigger: UpgradeNoticeTrigger;
	} >( {
		level: undefined,
		trigger: 'open',
	} );

	const trackNoticeShown = useEvent(
		( next: PaidCreditsStatus, level: SiteCreditsLevel, trigger: UpgradeNoticeTrigger ) => {
			if ( blogId === null ) {
				return;
			}
			const purchaseOptions = getCreditsPurchaseOptions(
				getSitePurchaseLink( next, blogId ),
				accessRef.current
			);
			trackImageStudioUpgradeNoticeShown( {
				mode,
				trigger,
				...getNoticeCredits( next, level, purchaseOptions ),
			} );
		}
	);

	const settleAccess = useEvent( () => {
		isAccessSettled.current = true;
		const held = heldNotice.current;
		heldNotice.current = null;
		// A level change replaces or clears the held notice, so the latest balance is at its level.
		if ( held && latestStatus.current ) {
			trackNoticeShown( latestStatus.current, held.level, held.trigger );
		}
	} );

	// Every opening records what caused it, so the Agent's `credits_meter_opened` has a twin here.
	const openMeter = useEvent(
		(
			next: PaidCreditsStatus,
			nextLevel: SiteCreditsLevel | null,
			trigger: CreditsMeterOpenedTrigger
		) => {
			setIsMeterOpen( true );
			trackImageStudioCreditsMeterOpened( {
				mode,
				trigger,
				...getMeterDetails( next, nextLevel ),
			} );
		}
	);

	// The Agent's parser, so the notice, the send block and the meter always agree. An unreadable
	// balance keeps whatever was known, so a fluke never clears or shows a notice.
	const applyCredits = useEvent(
		( snapshot: unknown, trigger: UpgradeNoticeTrigger, holdNotice = false ) => {
			if ( blogId === null ) {
				return false;
			}
			const next = parseLiveCreditsStatus( snapshot, blogId );
			if ( next?.plan !== 'paid' ) {
				return false;
			}
			latestStatus.current = next;
			const level = getSiteCreditsLevel( next.remaining );
			// A known balance running out opens the meter's details once. The first read stays quiet.
			if ( level === 'out' && shown.current.level !== undefined && shown.current.level !== 'out' ) {
				openMeter( next, level, 'exhausted' );
			}
			if ( level !== shown.current.level ) {
				if ( ! level ) {
					heldNotice.current = null;
				} else if ( isAccessSettled.current && ! holdNotice ) {
					trackNoticeShown( next, level, trigger );
				} else {
					heldNotice.current = { level, trigger };
				}
				shown.current = { level, trigger };
			}
			setStatus( next );
			return true;
		}
	);

	/** Reads the balance and who may buy; a notice event waits for the answer. */
	const checkCredits = useEvent( ( trigger: UpgradeNoticeTrigger ) => {
		// Callers check `canCheck`; this narrows the types.
		if ( blogId === null || ! authProvider ) {
			return Promise.resolve();
		}
		if ( runningCheck.current ) {
			return Promise.resolve();
		}
		clearTimeout( retry.current.timer );
		const token = checkToken.current;
		const turnBalancesBefore = turnBalanceCount.current;
		const request = new AbortController();
		runningCheck.current = request;
		isAccessSettled.current = false;

		return fetchSiteCredits( blogId, authProvider, request.signal ).then( ( result ) => {
			if ( runningCheck.current === request ) {
				runningCheck.current = undefined;
			}
			if ( token.isCancelled ) {
				return;
			}
			setIsLoading( false );
			if ( result ) {
				accessRef.current = result.access;
				setAccess( result.access );
			}
			settleAccess();
			if ( result === null ) {
				const delay = RETRY_DELAYS_MS[ retry.current.attempt++ ];
				if ( delay !== undefined ) {
					retry.current.timer = setTimeout( () => checkCredits( trigger ), delay );
				}
				return;
			}
			retry.current.attempt = 0;
			// A turn that finished while this check ran already reported a newer balance.
			if ( turnBalanceCount.current === turnBalancesBefore ) {
				applyCredits( result?.aiCredits, trigger );
			}
		} );
	} );

	useEffect( () => {
		if ( ! canCheck ) {
			return;
		}
		const token = { isCancelled: false };
		checkToken.current = token;
		const timeout = setTimeout( () => setIsLoading( false ), SITE_CREDITS_TIMEOUT_MS );
		checkCredits( 'open' ).then( () => clearTimeout( timeout ) );

		// Checkout opens in a new tab: the balance can change while the page is out of view or offline.
		const refresh = () => {
			if ( document.visibilityState !== 'hidden' ) {
				checkCredits( 'refresh' );
			}
		};
		window.addEventListener( 'focus', refresh );
		window.addEventListener( 'online', refresh );
		document.addEventListener( 'visibilitychange', refresh );

		return () => {
			token.isCancelled = true;
			clearTimeout( retry.current.timer );
			retry.current.attempt = 0;
			runningCheck.current?.abort();
			runningCheck.current = undefined;
			clearTimeout( timeout );
			window.removeEventListener( 'focus', refresh );
			window.removeEventListener( 'online', refresh );
			document.removeEventListener( 'visibilitychange', refresh );
		};
	}, [ canCheck, authProvider, checkCredits ] );

	// Only a turn's last update has its final balance.
	const onTaskUpdate = useEvent( ( update: TaskUpdate ) => {
		const isTurnEnd = update.final ?? TURN_END_STATES.includes( update.status.state );
		if ( ! isTurnEnd ) {
			return;
		}
		// A failed check left who may buy unknown, and a turn's balance doesn't say. Check
		// again, and hold this turn's notice event for the answer.
		const recheck = canCheck && ! accessRef.current && isAccessSettled.current;
		if ( applyCredits( update.aiCredits, 'refresh', recheck ) ) {
			turnBalanceCount.current++;
			if ( recheck ) {
				checkCredits( 'refresh' );
			}
		}
	} );

	const level = status ? getSiteCreditsLevel( status.remaining ) : null;
	const { purchaseUrl, purchaseKind, askToUpgrade, purchaseHint } = getCreditsPurchaseOptions(
		status && blogId !== null ? getSitePurchaseLink( status, blogId ) : undefined,
		access
	);
	const purchaseAction = useMemo(
		() => getCreditsPurchaseAction( { purchaseUrl, purchaseKind } ),
		[ purchaseUrl, purchaseKind ]
	);
	const isNoticeHidden = level === 'low' && isLowNoticeDismissed;

	// One handler for the notice and the credits popover; `trigger` says which showed the
	// link. A popover click can report `state: ok`, since the popover opens on a healthy balance.
	const trackUpgradeClick = useEvent( ( trigger: UpgradeLinkTrigger ) => {
		// Callers pass it only with a link; this narrows the types.
		if ( ! status || ! purchaseKind ) {
			return;
		}
		trackImageStudioUpgradeNoticeClick( {
			mode,
			trigger,
			...getNoticeCredits( status, level, { purchaseKind } ),
		} );
	} );

	const beforeSubmit = useEvent( () => {
		if ( ! status || level !== 'out' ) {
			return true;
		}
		// Every blocked send counts, even with the popover already open.
		openMeter( status, level, 'submit_blocked' );
		return false;
	} );

	// Only a click that opens the popover records; the hook's own openings record in `openMeter`.
	const toggleMeter = useEvent( ( open: boolean ) => {
		if ( open && ! isMeterOpen && status ) {
			openMeter( status, level, 'click' );
		} else {
			setIsMeterOpen( open );
		}
	} );

	// Memoised so the memoised chat doesn't re-render whenever the modal does.
	return useMemo(
		() => ( {
			isLimitReached: level === 'out',
			isLoading,
			onTaskUpdate,
			beforeSubmit,
			meter: status
				? {
						status,
						action: purchaseAction && {
							...purchaseAction,
							onClick: () => trackUpgradeClick( 'popover' ),
						},
						purchaseHint,
						isOpen: isMeterOpen,
						onToggle: toggleMeter,
					}
				: undefined,
			notice:
				status && level && ! isNoticeHidden
					? {
							icon: false,
							message: getCreditsNoticeMessage( level, status.remaining, askToUpgrade ),
							dismissible: level === 'low',
							onDismiss: () => setIsLowNoticeDismissed( true ),
							action: purchaseAction && {
								...purchaseAction,
								onClick: () => trackUpgradeClick( shown.current.trigger ),
							},
						}
					: undefined,
		} ),
		[
			status,
			level,
			purchaseAction,
			askToUpgrade,
			purchaseHint,
			isNoticeHidden,
			isMeterOpen,
			isLoading,
			onTaskUpdate,
			beforeSubmit,
			toggleMeter,
			trackUpgradeClick,
		]
	);
}
