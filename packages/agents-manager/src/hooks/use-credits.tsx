import { useAgentChat } from '@automattic/agenttic-client';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import CreditsMeter from '../components/credits-meter';
import { API_BASE_URL } from '../constants';
import { NO_SITE } from '../utils/agent-session';
import {
	type CreditsPlan,
	type CreditsStatus,
	buildMockCreditsStatus,
	clampPercent,
	formatPercent,
	isCreditsExhausted,
	isCreditsLow,
} from '../utils/credits';
import {
	type CreditsAccess,
	getCreditsCtaType,
	getCreditsNoticeMessage,
	getCreditsOutNotice,
	getCreditsPurchaseAction,
	getCreditsPurchaseOptions,
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
import {
	CREDITS_UPGRADE_SOURCE,
	buildLiveCreditsStatus,
	getLiveCreditSiteId,
	getLiveCreditsPurchaseLink,
	parseCreditSnapshot,
} from '../utils/live-credits';
import type { AgentConfig } from '../utils/create-agent-config';
import type { CreditSnapshot } from '../utils/live-credits';
import type { AuthProvider, TaskUpdate, UseAgentChatReturn } from '@automattic/agenttic-client';
import type { NoticeConfig, TrailingActions } from '@automattic/agenttic-ui';
import type { AgentsManagerSite } from '@automattic/data-stores';

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
	/** The exhausted notice, while a reply refused for no credits shows its error at a 0 balance. */
	refusalNotice?: NoticeConfig;
}

/**
 * Loads balances independently of prompts and keeps reads and terminal updates
 * scoped to the current site visit. The chat is composed here so refreshes can
 * avoid reading usage while a task is still running. Live balances also record
 * the credits Tracks events, and failed replies keep their refusal code, since
 * the chat's error only carries the reply's text. The code labels one Tracks
 * error; the refusal notice keeps it until the next turn. While AI credits are only
 * on internal test sites, pages the host says aren't in dev mode don't ask,
 * since nearly every site answers 404; a balance a turn reports still shows.
 */
export function useCredits( {
	enabled,
	agentConfig,
	siteKey,
	site,
	userId,
	isOpen,
	isNoticeVisible,
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
	} >();
	// Who may buy, from the balance read. Terminal updates don't carry it.
	const [ upgradeAccess, setUpgradeAccess ] = useState< { scope: typeof scope } & CreditsAccess >();
	const upgradeAccessRef = useRef( upgradeAccess );
	upgradeAccessRef.current = upgradeAccess;
	const [ seed ] = useState( readMockSeed );
	const [ percent, setPercent ] = useState( seed?.percent ?? 0 );
	// The live balance the credits events describe, set once it is known below.
	const liveCredits = useRef<
		{ status: CreditsStatus; siteId: number; agentConfig: AgentConfig } | undefined
	>( undefined );
	const recordCreditsEvent = useCallback(
		( eventName: CreditsTracksEventName, props?: Record< string, string > ) => {
			if ( currentScope.current !== scope || ! scope.active || ! liveCredits.current ) {
				return;
			}
			const { status, siteId, agentConfig: config } = liveCredits.current;
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
					setRefusal( code ? { scope, code } : undefined );
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
		if (
			! isOpen ||
			! canReadBalance( scope ) ||
			! scope.active ||
			currentScope.current !== scope ||
			processingRef.current ||
			balanceRequest.current
		) {
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
				setBalance( { scope, snapshot, isFromTurn: false } );
			} else {
				invalidateBalance();
			}
		} catch {
			if ( isCurrent() ) {
				invalidateBalance();
			}
		} finally {
			if ( balanceRequest.current === controller ) {
				balanceRequest.current = undefined;
			}
		}
	}, [ scope, isOpen, invalidateBalance ] );
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
	const snapshot = balance?.scope === scope ? balance.snapshot : undefined;
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
	}, [ isProcessing, enabled, isMockEnabled, seed, scope, invalidateBalance, refreshBalance ] );

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
	// New chat empties the thread but keeps the chat's error, which then draws nowhere.
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
		wasExhaustedRef.current = { scope, hasBalance: !! status, isExhausted };
	}, [ scope, status, isExhausted, isRefusedForCredits, setIsPopoverOpen ] );

	// That opening records once, when the chat first draws it, since a reply can
	// drain the balance while the chat is collapsed or minimised.
	const recordedOpeningRef = useRef< typeof popover >( undefined );
	useEffect( () => {
		if ( ! isOpen || ! isPopoverOpen || ! popover?.byItself ) {
			return;
		}
		if ( recordedOpeningRef.current !== popover ) {
			recordedOpeningRef.current = popover;
			recordCreditsEvent( 'calypso_agents_manager_credits_meter_opened', { trigger: 'exhausted' } );
		}
	}, [ isOpen, isPopoverOpen, popover, recordCreditsEvent ] );

	const handleAction = useCallback( () => {
		setIsPopoverOpen( false );
	}, [ setIsPopoverOpen ] );

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
		( placement?: 'refusal' ) =>
			recordCreditsEvent( 'calypso_agents_manager_credits_cta_clicked', {
				cta_type: ctaType,
				ref: CREDITS_UPGRADE_SOURCE,
				...( placement && { placement } ),
			} ),
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
			/>
		);
	}, [ status, isPopoverOpen, toggleMeter, handleAction, siteId, purchaseAction, purchaseHint ] );

	const notice = useMemo< NoticeConfig | undefined >( () => {
		if ( siteId && status?.plan === 'paid' ) {
			// A dismissed low notice must not hide the exhausted state.
			if ( isExhausted ) {
				return getCreditsOutNotice( status.remaining, askToUpgrade, purchaseAction );
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
		isLow,
		isLowNoticeDismissed,
		handleAction,
		dismissLowNotice,
	] );

	// Takes the notice's place, so it records no notice_shown of its own.
	const refusalNotice = useMemo< NoticeConfig | undefined >( () => {
		if ( ! isRefusedForCredits || ! siteId || status?.plan !== 'paid' || ! isExhausted ) {
			return undefined;
		}
		return getCreditsOutNotice(
			status.remaining,
			askToUpgrade,
			purchaseAction && { ...purchaseAction, onClick: () => recordPurchaseClick( 'refusal' ) }
		);
	}, [
		isRefusedForCredits,
		siteId,
		status,
		isExhausted,
		askToUpgrade,
		purchaseAction,
		recordPurchaseClick,
	] );

	// A turn's balance doesn't say who may buy. A read that finishes sets who may buy or drops the
	// balance, so it ends the wait; a cancelled read changes neither.
	const isAwaitingAccess =
		balance?.scope === scope && balance.isFromTurn && ! access && canReadBalance( scope );

	// Once per state for this site, user and agent, and only while the notice is drawn. After a
	// turn's balance it waits for the read of who may buy, so it names the button the notice shows.
	const shownNoticeState: CreditsState | undefined =
		siteId && status && notice && isNoticeVisible ? getCreditsState( status ) : undefined;
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
			return true;
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
		invalidateBalance,
		refreshBalance,
		setIsPopoverOpen,
		recordCreditsEvent,
	] );

	return useMemo(
		() => ( { chat, trailingActions, notice, beforeSubmit, takeRefusalCode, refusalNotice } ),
		[ chat, trailingActions, notice, beforeSubmit, takeRefusalCode, refusalNotice ]
	);
}
