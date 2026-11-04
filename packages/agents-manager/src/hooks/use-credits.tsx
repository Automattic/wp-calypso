import { useAgentChat } from '@automattic/agenttic-client';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import CreditsMeter from '../components/credits-meter';
import { API_BASE_URL } from '../constants';
import { NO_SITE } from '../utils/agent-session';
import { isContextOnlyMessage } from '../utils/context-only-message';
import {
	type CreditsPlan,
	type CreditsStatus,
	buildMockCreditsStatus,
	clampPercent,
	formatPercent,
	isCreditsExhausted,
	isCreditsLow,
	isCreditsOnTopUps,
} from '../utils/credits';
import {
	type CreditsAccess,
	type CreditsPurchaseAction,
	getCreditsBackNotice,
	getCreditsCtaType,
	getCreditsNoticeMessage,
	getCreditsOutNotice,
	getCreditsRefusalNotice,
	getCreditsPurchaseAction,
	getCreditsPurchaseOptions,
	getCreditsTopUpsNotice,
	parseCreditsAccess,
} from '../utils/credits-access';
import {
	CREDITS_EXHAUSTED_REFUSAL,
	type CreditsState,
	type CreditsTracksEventName,
	getCreditsState,
	getCreditsUserRole,
	getTaskRefusalCode,
	recordCreditsTracksEvent,
} from '../utils/credits-tracks';
import { getAgentsManagerInlineData } from '../utils/get-agents-manager-inline-data';
import { getLatestUserMessageIndex } from '../utils/latest-message';
import {
	CREDITS_UPGRADE_SOURCE,
	buildLiveCreditsStatus,
	formatCreditsResetDate,
	getLiveCreditSiteId,
	getLiveCreditsPurchaseLink,
	getLiveCreditsTopUpLink,
	parseCreditSnapshot,
} from '../utils/live-credits';
import type { AgentConfig } from '../utils/create-agent-config';
import type { CreditSnapshot, CreditsPurchaseKind } from '../utils/live-credits';
import type { AuthProvider, TaskUpdate, UseAgentChatReturn } from '@automattic/agenttic-client';
import type { NoticeConfig, TrailingActions } from '@automattic/agenttic-ui';
import type { AgentsManagerSite } from '@automattic/data-stores';

export interface CreditsAnswerAction extends CreditsPurchaseAction {
	kind: CreditsPurchaseKind;
}

export interface CreditsAnswerContent {
	status: CreditsStatus;
	/** When the monthly plan credits reset, already formatted for display. */
	resetDate: string;
	/** What the popover offers, and on the lower plans a credits pack too, which any admin may buy. */
	actions: CreditsAnswerAction[];
	/** Who to ask, when nothing can be bought. */
	purchaseHint?: string;
}

interface LiveCredits {
	status: CreditsStatus;
	siteId: number;
	agentConfig: AgentConfig;
}

interface MockCreditsSeed {
	plan: CreditsPlan;
	percent: number;
}

// Each sent message spends this much of the balance in the mock.
const MOCK_COST_PER_MESSAGE = 5;

/**
 * Isolated demo source for contexts without live site credits: `?am_credits=55&am_plan=free`
 * seeds the balance. Read once when the chat mounts, so the editor's router
 * dropping the parameter doesn't flip the state mid-session.
 */
function readMockSeed(): MockCreditsSeed | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	const params = new URLSearchParams( window.location.search );

	if ( ! params.has( 'am_credits' ) ) {
		return null;
	}

	const plan = params.get( 'am_plan' ) === 'paid' ? 'paid' : 'free';

	return { plan, percent: clampPercent( Number( params.get( 'am_credits' ) ) ) };
}

// The chat can unmount on close, so the notice states already recorded live
// here, keyed by visit identity and state, until the page reloads.
const recordedNoticeStates = new Set< string >();

function isTerminalUpdate( update: TaskUpdate ): boolean {
	return (
		update.final !== false &&
		( !! update.final || [ 'completed', 'failed', 'canceled' ].includes( update.status.state ) )
	);
}

// What a read needs for the whole visit; whether the chat is open or busy is checked per read.
// TODO: Remove the dev mode check before AI credits reach customers (FORNO-538).
function canReadBalance< Scope extends { siteId?: number; authProvider?: AuthProvider } >(
	scope: Scope
): scope is Scope & { siteId: number; authProvider: AuthProvider } {
	return (
		!! scope.siteId && !! scope.authProvider && getAgentsManagerInlineData()?.isDevMode !== false
	);
}

/** Whether the host says the site has no AI credits. Absent means the balance read decides. */
function isKnownUnmetered(): boolean {
	return getAgentsManagerInlineData()?.isMetered === false;
}

interface UseCreditsOptions {
	/** Surfaces without metering (Reader chat) pass false and get nothing. */
	enabled: boolean;
	agentConfig: AgentConfig;
	siteKey: string;
	site?: AgentsManagerSite | null;
	userId?: number;
	isOpen: boolean;
	/** Whether the chat draws the notice; the compact composer never does. */
	isNoticeVisible: boolean;
	/** Sends again once credits are back, given the refused question's text; the notice then offers Continue. */
	onTryAgain?: ( message: string ) => void;
	/** Sends `/credits` to the chat, from the popover's button. */
	onShowCredits?: () => void;
}

export interface UseCreditsResult {
	chat: UseAgentChatReturn;
	/** Meter + popover; hidden until this site returns valid allowance metadata. */
	trailingActions?: TrailingActions;
	/** Dismissible low-credit notice, or a persistent exhausted notice. */
	notice?: NoticeConfig;
	/** Blocks Send and suggestions at zero, keeping the typed text. */
	beforeSubmit: () => boolean;
	/** The last failed reply's refusal code, cleared once read so it labels one error only. */
	takeRefusalCode: () => string | undefined;
	/**
	 * While a reply refused for no credits shows its error: the exhausted notice at a 0 balance,
	 * a credits-back notice once it is above 0, and the last of these while it is unknown.
	 */
	refusalNotice?: NoticeConfig;
	/**
	 * How `/credits` answers. Absent when nothing can be said (credits off, a mock balance, no
	 * live read), so the command isn't handled and goes out as any text does.
	 */
	creditsCommand?: CreditsCommandReply;
	/**
	 * Once plan credits are spent and top-ups pay, when `notice` has nothing. Kept apart so it never
	 * hides the reply-wait notice. It sends no shown or dismissed event, only its button's clicks.
	 */
	topUpsNotice?: NoticeConfig;
}

/**
 * `balance` is the live balance with the purchase button or hint the popover shows, `stale` the
 * last known balance after a failed read, `loading` a read not yet settled, `failed` a read that
 * failed with no balance known, and `unmetered` a site that has no AI credits.
 */
export type CreditsCommandReply =
	| { state: 'balance' | 'stale'; answer: CreditsAnswerContent }
	| { state: 'loading' | 'failed' | 'unmetered' };

/**
 * Loads balances independently of prompts and keeps reads and terminal updates
 * scoped to the current site visit. The chat is composed here so refreshes can
 * avoid reading usage while a task is still running. Live balances also record
 * the credits Tracks events, and failed replies keep their refusal code, since
 * the chat's error only carries the reply's text. The code labels one Tracks
 * error; the refusal notice keeps it until the next turn. A zero last shown while
 * the chat was hidden isn't drawn again until the opening read, or a turn that
 * ends while it shows, confirms it, since credits bought in another tab would
 * otherwise greet the user as a stale zero.
 * While AI credits are only on internal test sites, pages the host says aren't
 * in dev mode don't ask, since nearly every site answers 404; a balance a turn
 * reports still shows.
 */
export function useCredits( {
	enabled,
	agentConfig,
	siteKey,
	site,
	userId,
	isOpen,
	isNoticeVisible,
	onTryAgain,
	onShowCredits,
}: UseCreditsOptions ): UseCreditsResult {
	const isMockEnabled = enabled && siteKey === NO_SITE;
	const requestedSiteId = enabled ? getLiveCreditSiteId( siteKey, agentConfig ) : undefined;
	const { authProvider, authenticationScope } = agentConfig;
	const siteId =
		authenticationScope?.siteId === requestedSiteId && authenticationScope?.userId === userId
			? requestedSiteId
			: undefined;
	const scopeIdentity = JSON.stringify( [ siteKey, userId, agentConfig.agentId, enabled ] );
	const scope = useMemo(
		() => ( {
			identity: scopeIdentity,
			siteId,
			authProvider,
			active: true,
			validTerminalRevision: 0,
		} ),
		[ scopeIdentity, siteId, authProvider ]
	);
	const currentScope = useRef( scope );
	currentScope.current = scope;
	const balanceRequest = useRef< AbortController | undefined >( undefined );
	const [ balance, setBalance ] = useState< {
		scope: typeof scope;
		snapshot: CreditSnapshot;
		isFromTurn: boolean;
		/**
		 * A zero last shown while the chat was hidden, kept off screen while the chat
		 * shows until a read or a turn settles it.
		 */
		isUnconfirmed?: boolean;
	} >();
	// How the last balance read ended when it left no balance: no credits on the site, or a failure.
	const [ readOutcome, setReadOutcome ] = useState< {
		scope: typeof scope;
		outcome: 'unmetered' | 'failed';
	} >();
	// The last valid balance, kept past a failed read for `/credits` to show as the last known.
	const lastKnownSnapshot = useRef< { scope: typeof scope; snapshot: CreditSnapshot } | undefined >(
		undefined
	);
	// Who may buy, from the balance read. Terminal updates don't carry it.
	const [ upgradeAccess, setUpgradeAccess ] = useState< { scope: typeof scope } & CreditsAccess >();
	const upgradeAccessRef = useRef( upgradeAccess );
	upgradeAccessRef.current = upgradeAccess;
	const [ seed ] = useState( readMockSeed );
	const [ percent, setPercent ] = useState( seed?.percent ?? 0 );
	// The live balance the credits events describe, set once it is known below.
	const liveCredits = useRef< LiveCredits | undefined >( undefined );
	// `shown` stands in while the balance is unknown, for a notice that still shows an earlier one.
	const recordCreditsEvent = useCallback(
		(
			eventName: CreditsTracksEventName,
			props?: Record< string, string >,
			shown?: LiveCredits
		) => {
			const credits = liveCredits.current ?? shown;
			if ( currentScope.current !== scope || ! scope.active || ! credits ) {
				return;
			}
			const { status, siteId, agentConfig: config } = credits;
			recordCreditsTracksEvent(
				eventName,
				{ status, siteId, contextProvider: config.contextProvider },
				props
			);
		},
		[ scope ]
	);
	const [ dismissedNoticeScope, setDismissedNoticeScope ] = useState< typeof scope >();
	const isLowNoticeDismissed = dismissedNoticeScope === scope;
	const dismissLowNotice = useCallback( () => {
		if ( currentScope.current === scope && scope.active ) {
			recordCreditsEvent( 'calypso_agents_manager_credits_notice_dismissed' );
			setDismissedNoticeScope( scope );
		}
	}, [ scope, recordCreditsEvent ] );
	// The top-ups notice has its own dismissal, which records nothing.
	const [ dismissedTopUpsNoticeScope, setDismissedTopUpsNoticeScope ] = useState< typeof scope >();
	const isTopUpsNoticeDismissed = dismissedTopUpsNoticeScope === scope;
	const dismissTopUpsNotice = useCallback( () => {
		if ( currentScope.current === scope && scope.active ) {
			setDismissedTopUpsNoticeScope( scope );
		}
	}, [ scope ] );
	// A new object per opening, so an opening by itself records once and a close drops it unrecorded.
	const [ popover, setPopover ] = useState< { scope: typeof scope; byItself: boolean } >();
	const isPopoverOpen = popover?.scope === scope;
	const setIsPopoverOpen = useCallback(
		( open: boolean, { byItself = false } = {} ) => {
			if ( currentScope.current === scope && scope.active ) {
				// Read through the updater, so this callback, and the chat config built on it, stays stable.
				setPopover( ( current ) => {
					if ( ! open ) {
						return undefined;
					}
					return current?.scope === scope ? current : { scope, byItself };
				} );
			}
		},
		[ scope ]
	);
	const confirmBalance = useCallback( () => {
		setBalance( ( current ) =>
			current?.scope === scope && current.isUnconfirmed
				? { ...current, isUnconfirmed: false }
				: current
		);
	}, [ scope ] );
	const invalidateBalance = useCallback( () => {
		if ( currentScope.current === scope && scope.active ) {
			setBalance( undefined );
			setIsPopoverOpen( false );
		}
	}, [ scope, setIsPopoverOpen ] );
	const observeTaskUpdate = useCallback(
		( update: TaskUpdate ) => {
			if (
				! scope.active ||
				currentScope.current !== scope ||
				! scope.siteId ||
				! isTerminalUpdate( update )
			) {
				return;
			}
			balanceRequest.current?.abort();
			balanceRequest.current = undefined;
			const snapshot = parseCreditSnapshot( update.aiCredits, scope.siteId );
			if ( snapshot && Date.parse( snapshot.resets_at ) > Date.now() ) {
				scope.validTerminalRevision++;
				lastKnownSnapshot.current = { scope, snapshot };
				setReadOutcome( undefined );
				setBalance( { scope, snapshot, isFromTurn: true } );
			} else {
				invalidateBalance();
			}
		},
		[ scope, invalidateBalance ]
	);
	// Kept for whichever chat shows the failure, so not scoped to the visit.
	const refusalCode = useRef< string | undefined >( undefined );
	const takeRefusalCode = useCallback( () => {
		const code = refusalCode.current;
		refusalCode.current = undefined;
		return code;
	}, [] );
	// The same code for the refusal notice, which stays however often the code is read.
	const [ refusal, setRefusal ] = useState< { scope: typeof scope; code: string } >();
	const chatConfig = useMemo(
		() => ( {
			...agentConfig,
			onTaskUpdate: async ( update: TaskUpdate ) => {
				if ( isTerminalUpdate( update ) ) {
					const code = getTaskRefusalCode( update );
					refusalCode.current = code;
					// A late reply from an earlier visit must not clear this visit's notice.
					if ( currentScope.current === scope ) {
						setRefusal( code ? { scope, code } : undefined );
					}
				}
				observeTaskUpdate( update );
				await agentConfig.onTaskUpdate?.( update );
			},
		} ),
		[ agentConfig, scope, observeTaskUpdate ]
	);
	const chat = useAgentChat( chatConfig );
	const { isProcessing } = chat;
	const processingRef = useRef( isProcessing );
	processingRef.current = isProcessing;
	const refreshBalance = useCallback( async () => {
		if ( ! isOpen || ! scope.active || currentScope.current !== scope ) {
			return;
		}
		if ( ! canReadBalance( scope ) ) {
			// Nothing can confirm the zero, so draw it.
			confirmBalance();
			return;
		}
		if ( processingRef.current || balanceRequest.current ) {
			return;
		}
		const { authProvider } = scope;
		const controller = new AbortController();
		balanceRequest.current = controller;
		const revision = scope.validTerminalRevision;
		const isCurrent = () =>
			! controller.signal.aborted &&
			scope.active &&
			currentScope.current === scope &&
			scope.validTerminalRevision === revision &&
			! processingRef.current;
		try {
			const headers = await authProvider();
			if ( ! isCurrent() ) {
				return;
			}
			const response = await fetch(
				`${ API_BASE_URL }/wpcom/v2/sites/${ scope.siteId }/ai/credits`,
				{ method: 'GET', headers, signal: controller.signal, cache: 'no-store' }
			);
			const data = response.ok ? await response.json() : undefined;
			if ( ! isCurrent() ) {
				return;
			}
			// A failed read keeps the last answer; checkout still enforces it.
			if ( data ) {
				setUpgradeAccess( { scope, ...parseCreditsAccess( data ) } );
			}
			const snapshot = parseCreditSnapshot( data?.ai_credits, scope.siteId );
			if ( snapshot && Date.parse( snapshot.resets_at ) > Date.now() ) {
				lastKnownSnapshot.current = { scope, snapshot };
				setReadOutcome( undefined );
				setBalance( { scope, snapshot, isFromTurn: false } );
			} else {
				// A 404 or an answer with no credits data means no metering; any other miss is a failure.
				const isUnmetered = response.status === 404 || ( response.ok && ! data?.ai_credits );
				setReadOutcome( { scope, outcome: isUnmetered ? 'unmetered' : 'failed' } );
				invalidateBalance();
			}
		} catch {
			if ( isCurrent() ) {
				setReadOutcome( { scope, outcome: 'failed' } );
				invalidateBalance();
			}
		} finally {
			if ( balanceRequest.current === controller ) {
				balanceRequest.current = undefined;
			}
		}
	}, [ scope, isOpen, confirmBalance, invalidateBalance ] );
	useEffect( () => {
		scope.active = true;
		return () => {
			scope.active = false;
		};
	}, [ scope ] );
	useEffect( () => {
		if ( ! isOpen || ! scope.siteId ) {
			return;
		}
		void refreshBalance();
		const onFocus = () => {
			if ( document.visibilityState !== 'hidden' ) {
				void refreshBalance();
			}
		};
		window.addEventListener( 'focus', onFocus );
		window.addEventListener( 'online', onFocus );
		document.addEventListener( 'visibilitychange', onFocus );
		return () => {
			balanceRequest.current?.abort();
			balanceRequest.current = undefined;
			window.removeEventListener( 'focus', onFocus );
			window.removeEventListener( 'online', onFocus );
			document.removeEventListener( 'visibilitychange', onFocus );
		};
	}, [ scope, isOpen, refreshBalance ] );
	useEffect( () => {
		if ( isProcessing ) {
			balanceRequest.current?.abort();
			balanceRequest.current = undefined;
			// A new turn's error must not take an earlier reply's code.
			refusalCode.current = undefined;
			setRefusal( undefined );
		}
	}, [ isProcessing ] );
	const isAwaitingConfirmation = isOpen && balance?.scope === scope && !! balance.isUnconfirmed;
	const snapshot =
		balance?.scope === scope && ! isAwaitingConfirmation ? balance.snapshot : undefined;
	useEffect( () => {
		if ( ! snapshot ) {
			return;
		}
		let timer: ReturnType< typeof setTimeout >;
		const expire = () => {
			const delay = Date.parse( snapshot.resets_at ) - Date.now();
			if ( delay <= 0 ) {
				invalidateBalance();
				void refreshBalance();
			} else {
				timer = setTimeout( expire, Math.min( delay, 2147483647 ) );
			}
		};
		expire();
		return () => clearTimeout( timer );
	}, [ snapshot, invalidateBalance, refreshBalance ] );

	const wasProcessingRef = useRef( {
		scope,
		isProcessing,
		validTerminalRevision: scope.validTerminalRevision,
	} );
	useEffect( () => {
		const previous = wasProcessingRef.current;
		if ( previous.scope === scope && previous.isProcessing && ! isProcessing && enabled ) {
			if ( scope.siteId ) {
				// A turn that ends while the chat shows is the latest word on the balance.
				if ( isOpen ) {
					confirmBalance();
				}
				if ( previous.validTerminalRevision === scope.validTerminalRevision ) {
					invalidateBalance();
					void refreshBalance();
				} else if ( upgradeAccessRef.current?.scope !== scope ) {
					// The task brought the balance but not who may buy, so read once more.
					void refreshBalance();
				}
			} else if ( isMockEnabled && seed ) {
				setPercent( ( current ) => Math.max( 0, current - MOCK_COST_PER_MESSAGE ) );
			}
		}
		wasProcessingRef.current = {
			scope,
			isProcessing,
			validTerminalRevision:
				previous.scope === scope && previous.isProcessing && isProcessing
					? previous.validTerminalRevision
					: scope.validTerminalRevision,
		};
	}, [
		isProcessing,
		enabled,
		isMockEnabled,
		seed,
		scope,
		isOpen,
		confirmBalance,
		invalidateBalance,
		refreshBalance,
	] );

	const status = useMemo( () => {
		if ( ! enabled ) {
			return undefined;
		}
		if ( siteId ) {
			return snapshot ? buildLiveCreditsStatus( snapshot ) : undefined;
		}
		return isMockEnabled && seed ? buildMockCreditsStatus( seed.plan, percent ) : undefined;
	}, [ enabled, siteId, snapshot, isMockEnabled, seed, percent ] );

	const isExhausted = status ? isCreditsExhausted( status ) : false;
	const isLow = status ? isCreditsLow( status ) : false;
	// Only an earlier render knows a zero was shown while hidden, so it's state, marked while rendering.
	if ( ! isOpen && isExhausted && balance?.scope === scope && ! balance.isUnconfirmed ) {
		setBalance( { ...balance, isUnconfirmed: true } );
	}
	// Big Sky's clearMessages empties the thread but keeps the chat's error, which then draws nowhere.
	const isRefusedForCredits =
		refusal?.scope === scope &&
		refusal.code === CREDITS_EXHAUSTED_REFUSAL &&
		chat.messages.length > 0;
	const planPurchaseLink = status ? getLiveCreditsPurchaseLink( status, siteId, site ) : undefined;
	const access = upgradeAccess?.scope === scope ? upgradeAccess : undefined;
	const { purchaseUrl, purchaseKind, askToUpgrade, purchaseHint } = getCreditsPurchaseOptions(
		planPurchaseLink,
		access
	);
	const ctaType = getCreditsCtaType( purchaseKind, askToUpgrade );
	// Mock and free balances send no events.
	liveCredits.current = siteId && status ? { status, siteId, agentConfig } : undefined;

	// A known balance draining to zero opens once; initial reads and new visits stay
	// quiet, as does a refused reply, whose notice offers the purchase instead.
	const wasExhaustedRef = useRef( { scope, hasBalance: !! status, isExhausted } );
	useEffect( () => {
		const previous = wasExhaustedRef.current;
		if (
			previous.scope === scope &&
			previous.hasBalance &&
			isExhausted &&
			! previous.isExhausted &&
			! isRefusedForCredits
		) {
			setIsPopoverOpen( true, { byItself: true } );
		}
		// A popover the zero opened would announce, and record, a balance that's gone.
		if ( status && ! isExhausted ) {
			setPopover( ( current ) =>
				current?.scope === scope && current.byItself ? undefined : current
			);
		}
		wasExhaustedRef.current = { scope, hasBalance: !! status, isExhausted };
	}, [ scope, status, isExhausted, isRefusedForCredits, setIsPopoverOpen ] );

	// That opening records once, when the chat first draws it, since a reply can
	// drain the balance while the chat is collapsed or minimised.
	const recordedOpeningRef = useRef< typeof popover >( undefined );
	useEffect( () => {
		if ( ! isOpen || ! isPopoverOpen || ! popover?.byItself || ! isExhausted ) {
			return;
		}
		if ( recordedOpeningRef.current !== popover ) {
			recordedOpeningRef.current = popover;
			recordCreditsEvent( 'calypso_agents_manager_credits_meter_opened', { trigger: 'exhausted' } );
		}
	}, [ isOpen, isPopoverOpen, popover, isExhausted, recordCreditsEvent ] );

	const handleAction = useCallback( () => {
		setIsPopoverOpen( false );
	}, [ setIsPopoverOpen ] );

	// Only where `/credits` is answered in the browser, as anywhere else it would reach the model.
	const canShowCredits = !! onShowCredits && !! siteId && canReadBalance( scope );
	const showCredits = useCallback( () => {
		recordCreditsEvent( 'calypso_agents_manager_credits_show_clicked' );
		setIsPopoverOpen( false );
		onShowCredits?.();
	}, [ onShowCredits, recordCreditsEvent, setIsPopoverOpen ] );

	// Only a click that opens the popover records here; an opening by itself records above.
	const toggleMeter = useCallback(
		( open: boolean ) => {
			if ( open && ! isPopoverOpen ) {
				recordCreditsEvent( 'calypso_agents_manager_credits_meter_opened', { trigger: 'click' } );
			}
			setIsPopoverOpen( open );
		},
		[ isPopoverOpen, recordCreditsEvent, setIsPopoverOpen ]
	);

	// Every click counts; the link opens in a new tab without waiting for the event.
	const recordPurchaseClick = useCallback(
		( placement: 'refusal' | 'none' = 'none', shown?: LiveCredits ) =>
			recordCreditsEvent(
				'calypso_agents_manager_credits_cta_clicked',
				{ cta_type: ctaType, ref: CREDITS_UPGRADE_SOURCE, placement },
				shown
			),
		[ ctaType, recordCreditsEvent ]
	);

	// One action for the notice and the popover.
	const purchaseAction = useMemo( () => {
		const action = getCreditsPurchaseAction( { purchaseUrl, purchaseKind } );
		return action && { ...action, onClick: () => recordPurchaseClick() };
	}, [ purchaseUrl, purchaseKind, recordPurchaseClick ] );

	const trailingActions = useMemo< TrailingActions | undefined >( () => {
		if ( ! status ) {
			return undefined;
		}
		return (
			<CreditsMeter
				status={ status }
				isOpen={ isPopoverOpen }
				onToggle={ toggleMeter }
				onAction={ siteId ? undefined : handleAction }
				action={ purchaseAction }
				purchaseHint={ purchaseHint }
				onShowCredits={ canShowCredits ? showCredits : undefined }
			/>
		);
	}, [
		status,
		isPopoverOpen,
		toggleMeter,
		handleAction,
		siteId,
		purchaseAction,
		purchaseHint,
		canShowCredits,
		showCredits,
	] );

	// Continue resends text only, as the conversation's Retry does, so a question with
	// images is asked again by hand.
	const refusedQuestion = useMemo( () => {
		const question = chat.messages[ getLatestUserMessageIndex( chat.messages ) ];
		if ( ! question || question.content.some( ( part ) => part.type !== 'text' ) ) {
			return undefined;
		}
		const text = question.content
			.map( ( part ) => part.text ?? '' )
			.join( ' ' )
			.trim();
		return text || undefined;
	}, [ chat.messages ] );
	// The refusal brings only its code, so the thread tells whether the server took the question.
	// Any agent message after it that isn't context-only says it did, even one the transcript
	// hides, such as a failed block edit's: it follows a model call.
	const hasTurnOutput = useMemo( () => {
		const questionIndex = getLatestUserMessageIndex( chat.messages );
		return (
			questionIndex >= 0 &&
			chat.messages
				.slice( questionIndex + 1 )
				.some( ( message ) => message.role === 'agent' && ! isContextOnlyMessage( message ) )
		);
	}, [ chat.messages ] );
	const tryAgainAction = useMemo< NoticeConfig[ 'action' ] >(
		() =>
			onTryAgain && refusedQuestion
				? {
						label: __( 'Continue', __i18n_text_domain__ ),
						onClick: () => onTryAgain( refusedQuestion ),
					}
				: undefined,
		[ onTryAgain, refusedQuestion ]
	);

	const notice = useMemo< NoticeConfig | undefined >( () => {
		if ( siteId && status?.plan === 'paid' ) {
			// A dismissed low notice must not hide the exhausted state.
			if ( isExhausted ) {
				return getCreditsOutNotice( status.remaining, askToUpgrade, purchaseAction );
			}
			if ( isRefusedForCredits ) {
				return getCreditsBackNotice( tryAgainAction );
			}
			if ( isLow && ! isLowNoticeDismissed ) {
				return {
					icon: false,
					message: getCreditsNoticeMessage( 'low', status.remaining, askToUpgrade ),
					action: purchaseAction,
					dismissible: true,
					onDismiss: dismissLowNotice,
				};
			}
		}
		if ( ! status || status.plan !== 'free' ) {
			return undefined;
		}

		if ( isExhausted ) {
			return {
				icon: false,
				message: __( 'You’re out of free credits.', __i18n_text_domain__ ),
				action: { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: handleAction },
				dismissible: false,
			};
		}

		if ( isLow && ! isLowNoticeDismissed ) {
			return {
				icon: false,
				message: sprintf(
					/* translators: %s: percentage of free credits left, e.g. "15" or "<1" */
					__( '%s%% of free credits left.', __i18n_text_domain__ ),
					formatPercent( status.percent )
				),
				action: { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: handleAction },
				dismissible: true,
				onDismiss: dismissLowNotice,
			};
		}

		return undefined;
	}, [
		status,
		siteId,
		purchaseAction,
		askToUpgrade,
		isExhausted,
		isRefusedForCredits,
		tryAgainAction,
		isLow,
		isLowNoticeDismissed,
		handleAction,
		dismissLowNotice,
	] );

	// A low balance keeps its own notice, even once that one is closed.
	const topUpsNotice = useMemo< NoticeConfig | undefined >( () => {
		if (
			! siteId ||
			status?.plan !== 'paid' ||
			! isCreditsOnTopUps( status ) ||
			isRefusedForCredits ||
			isLow ||
			isTopUpsNoticeDismissed
		) {
			return undefined;
		}
		return getCreditsTopUpsNotice(
			status.remaining,
			askToUpgrade,
			purchaseAction,
			dismissTopUpsNotice
		);
	}, [
		siteId,
		status,
		isRefusedForCredits,
		isLow,
		isTopUpsNoticeDismissed,
		askToUpgrade,
		purchaseAction,
		dismissTopUpsNotice,
	] );

	// The card stays in the thread as a record once credits are back; the composer says so.
	const liveRefusalNotice = useMemo< NoticeConfig | undefined >( () => {
		if ( ! isRefusedForCredits || ! siteId || status?.plan !== 'paid' ) {
			return undefined;
		}
		const shown = { status, siteId, agentConfig };
		return getCreditsRefusalNotice(
			purchaseKind,
			purchaseAction && {
				...purchaseAction,
				onClick: () => recordPurchaseClick( 'refusal', shown ),
			},
			hasTurnOutput
		);
	}, [
		isRefusedForCredits,
		siteId,
		status,
		agentConfig,
		purchaseKind,
		purchaseAction,
		recordPurchaseClick,
		hasTurnOutput,
	] );
	// An unknown balance keeps this refusal's last notice, as a failed read keeps the last answer.
	// Only an earlier render knows that notice, so it's state, updated while rendering.
	const [ shownRefusal, setShownRefusal ] = useState< {
		refusal: typeof refusal;
		notice: NoticeConfig;
	} >();
	if (
		liveRefusalNotice &&
		( shownRefusal?.refusal !== refusal || shownRefusal?.notice !== liveRefusalNotice )
	) {
		setShownRefusal( { refusal, notice: liveRefusalNotice } );
	}
	const heldRefusalNotice =
		refusal && shownRefusal?.refusal === refusal ? shownRefusal.notice : undefined;
	const refusalNotice = isRefusedForCredits
		? ( liveRefusalNotice ?? heldRefusalNotice )
		: undefined;

	// A turn's balance doesn't say who may buy. A read that finishes sets who may buy or drops the
	// balance, so it ends the wait; a cancelled read changes neither.
	const isAwaitingAccess =
		balance?.scope === scope && balance.isFromTurn && ! access && canReadBalance( scope );

	// A low notice behind the credits-back one waits until it shows.
	const isLowNoticeBehindCreditsBack = !! refusalNotice && ! isExhausted;
	// Once per state for this site, user and agent, and only while the notice is drawn. After a
	// turn's balance it waits for the read of who may buy, so it names the button the notice shows.
	const shownNoticeState: CreditsState | undefined =
		siteId && status && notice && isNoticeVisible && ! isLowNoticeBehindCreditsBack
			? getCreditsState( status )
			: undefined;
	const userRole = getCreditsUserRole( access?.canBuyCredits );
	useEffect( () => {
		if ( ! shownNoticeState || isAwaitingAccess ) {
			return;
		}
		const key = JSON.stringify( [ scopeIdentity, shownNoticeState ] );
		if ( recordedNoticeStates.has( key ) ) {
			return;
		}
		recordedNoticeStates.add( key );
		recordCreditsEvent( 'calypso_agents_manager_credits_notice_shown', {
			user_role: userRole,
			cta_type: ctaType,
			ref: purchaseKind ? CREDITS_UPGRADE_SOURCE : 'none',
		} );
	}, [
		shownNoticeState,
		isAwaitingAccess,
		scopeIdentity,
		userRole,
		ctaType,
		purchaseKind,
		recordCreditsEvent,
	] );

	// A known zero opens the existing details without discarding the draft.
	const beforeSubmit = useCallback( () => {
		if ( snapshot && Date.parse( snapshot.resets_at ) <= Date.now() ) {
			invalidateBalance();
			void refreshBalance();
			return true;
		}
		if ( ! status ) {
			// An unconfirmed zero still blocks; the opening read settles it in a moment.
			return ! isAwaitingConfirmation;
		}

		if ( isExhausted ) {
			// Every blocked send counts, even with the popover already open.
			recordCreditsEvent( 'calypso_agents_manager_credits_meter_opened', {
				trigger: 'submit_blocked',
			} );
			setIsPopoverOpen( true );
			return false;
		}

		return true;
	}, [
		status,
		isExhausted,
		snapshot,
		isAwaitingConfirmation,
		invalidateBalance,
		refreshBalance,
		setIsPopoverOpen,
		recordCreditsEvent,
	] );

	const recordTopUpClick = useCallback(
		( shown?: LiveCredits ) =>
			recordCreditsEvent(
				'calypso_agents_manager_credits_cta_clicked',
				{ cta_type: 'top_up', ref: CREDITS_UPGRADE_SOURCE, placement: 'none' },
				shown
			),
		[ recordCreditsEvent ]
	);

	// Personal and Premium upgrade first, though a credits pack is cheaper than a plan. Whoever
	// can't upgrade gets no credits pack either, as in the meter.
	const addCreditsAction = useMemo< CreditsAnswerAction | undefined >( () => {
		if (
			planPurchaseLink?.kind !== 'upgrade' ||
			access?.canUpgrade !== true ||
			access.canBuyCredits !== true
		) {
			return undefined;
		}
		const link = getLiveCreditsTopUpLink( siteId, site );
		const action =
			link && getCreditsPurchaseAction( { purchaseUrl: link.url, purchaseKind: 'top_up' } );
		return (
			action && {
				...action,
				kind: 'top_up' as const,
				onClick: () => recordTopUpClick(),
			}
		);
	}, [ planPurchaseLink, access, siteId, site, recordTopUpClick ] );

	// Live balances only: a mock or an unknown balance has nothing true to say.
	const creditsAnswer = useMemo< CreditsAnswerContent | undefined >( () => {
		if ( ! siteId || ! status || ! snapshot ) {
			return undefined;
		}
		// The card stays in the thread after a later read fails, so its clicks count against its own balance.
		const shown: LiveCredits = { status, siteId, agentConfig };
		const actions: CreditsAnswerAction[] = [];
		if ( purchaseAction && purchaseKind ) {
			actions.push( {
				...purchaseAction,
				kind: purchaseKind,
				onClick: () => recordPurchaseClick( 'none', shown ),
			} );
		}
		if ( addCreditsAction ) {
			actions.push( { ...addCreditsAction, onClick: () => recordTopUpClick( shown ) } );
		}
		return {
			status,
			resetDate: formatCreditsResetDate( snapshot.resets_at ),
			actions,
			purchaseHint: actions.length ? undefined : purchaseHint,
		};
	}, [
		siteId,
		status,
		snapshot,
		agentConfig,
		purchaseKind,
		purchaseAction,
		addCreditsAction,
		purchaseHint,
		recordPurchaseClick,
		recordTopUpClick,
	] );

	const lastKnown =
		lastKnownSnapshot.current?.scope === scope &&
		Date.parse( lastKnownSnapshot.current.snapshot.resets_at ) > Date.now()
			? lastKnownSnapshot.current.snapshot
			: undefined;
	const failedOutcome = readOutcome?.scope === scope ? readOutcome.outcome : undefined;
	// Live balances only: a mock balance, or a read that can't run, has nothing true to say.
	const creditsCommand = useMemo< CreditsCommandReply | undefined >( () => {
		if ( ! enabled || ! siteId || ! canReadBalance( scope ) ) {
			return undefined;
		}
		if ( isKnownUnmetered() ) {
			return { state: 'unmetered' };
		}
		if ( creditsAnswer ) {
			return { state: 'balance', answer: creditsAnswer };
		}
		if ( failedOutcome === 'unmetered' ) {
			return { state: 'unmetered' };
		}
		if ( failedOutcome === 'failed' ) {
			return lastKnown
				? {
						state: 'stale',
						answer: {
							status: buildLiveCreditsStatus( lastKnown ),
							resetDate: formatCreditsResetDate( lastKnown.resets_at ),
							actions: [],
						},
					}
				: { state: 'failed' };
		}
		return { state: 'loading' };
	}, [ enabled, siteId, scope, creditsAnswer, failedOutcome, lastKnown ] );

	return useMemo(
		() => ( {
			chat,
			trailingActions,
			notice,
			beforeSubmit,
			takeRefusalCode,
			refusalNotice,
			creditsCommand,
			topUpsNotice,
		} ),
		[
			chat,
			trailingActions,
			notice,
			beforeSubmit,
			takeRefusalCode,
			refusalNotice,
			creditsCommand,
			topUpsNotice,
		]
	);
}
