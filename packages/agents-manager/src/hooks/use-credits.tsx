import { useAgentChat } from '@automattic/agenttic-client';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import CreditsMeter from '../components/credits-meter';
import { API_BASE_URL } from '../constants';
import { NO_SITE } from '../utils/agent-session';
import {
	type CreditsPlan,
	type CreditsStatus,
	buildMockCreditsStatus,
	clampPercent,
	formatCreditsShort,
	formatPercent,
	isCreditsExhausted,
	isCreditsLow,
} from '../utils/credits';
import {
	type CreditsState,
	type CreditsTracksEventName,
	getCreditsCtaType,
	getCreditsState,
	getCreditsUserRole,
	getTaskRefusalCode,
	recordCreditsTracksEvent,
} from '../utils/credits-tracks';
import {
	buildLiveCreditsStatus,
	getLiveCreditSiteId,
	getLiveCreditsUpgradeUrl,
	parseCreditSnapshot,
} from '../utils/live-credits';
import type { AgentConfig } from '../utils/create-agent-config';
import type { CreditSnapshot } from '../utils/live-credits';
import type { TaskUpdate, UseAgentChatReturn } from '@automattic/agenttic-client';
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

interface UseCreditsResult {
	chat: UseAgentChatReturn;
	/** Dot + popover; hidden until this site returns valid allowance metadata. */
	trailingActions?: TrailingActions;
	/** Dismissible low-credit notice, or a persistent exhausted notice. */
	notice?: NoticeConfig;
	/** Blocks Send and suggestions at zero, keeping the typed text. */
	beforeSubmit: () => boolean;
	/** The last failed reply's refusal code, cleared once read so it labels one error only. */
	takeRefusalCode: () => string | undefined;
}

/**
 * Loads balances independently of prompts and keeps reads and terminal updates
 * scoped to the current site visit. The chat is composed here so refreshes can
 * avoid reading usage while a task is still running. Live balances also record
 * the credits Tracks events, and failed replies keep their refusal code, since
 * the chat's error only carries the reply's text.
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
	const [ balance, setBalance ] = useState< { scope: typeof scope; snapshot: CreditSnapshot } >();
	// Who may buy, from the balance read. Terminal updates don't carry it.
	const [ upgradeAccess, setUpgradeAccess ] = useState< {
		scope: typeof scope;
		canBuyCredits?: boolean;
		canUpgrade?: boolean;
	} >();
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
	const [ popoverScope, setPopoverScope ] = useState< typeof scope >();
	const isPopoverOpen = popoverScope === scope;
	const setIsPopoverOpen = useCallback(
		( open: boolean ) => {
			if ( currentScope.current === scope && scope.active ) {
				setPopoverScope( open ? scope : undefined );
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
				setBalance( { scope, snapshot } );
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
	const chatConfig = useMemo(
		() => ( {
			...agentConfig,
			onTaskUpdate: async ( update: TaskUpdate ) => {
				if ( isTerminalUpdate( update ) ) {
					refusalCode.current = getTaskRefusalCode( update );
				}
				observeTaskUpdate( update );
				await agentConfig.onTaskUpdate?.( update );
			},
		} ),
		[ agentConfig, observeTaskUpdate ]
	);
	const chat = useAgentChat( chatConfig );
	const { isProcessing } = chat;
	const processingRef = useRef( isProcessing );
	processingRef.current = isProcessing;
	const refreshBalance = useCallback( async () => {
		const { authProvider } = scope;
		if (
			! isOpen ||
			! scope.siteId ||
			! authProvider ||
			! scope.active ||
			currentScope.current !== scope ||
			processingRef.current ||
			balanceRequest.current
		) {
			return;
		}
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
				setUpgradeAccess( {
					scope,
					canBuyCredits:
						typeof data.can_buy_credits === 'boolean' ? data.can_buy_credits : undefined,
					canUpgrade: typeof data.can_upgrade === 'boolean' ? data.can_upgrade : undefined,
				} );
			}
			const snapshot = parseCreditSnapshot( data?.ai_credits, scope.siteId );
			if ( snapshot && Date.parse( snapshot.resets_at ) > Date.now() ) {
				setBalance( { scope, snapshot } );
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
	const planUpgradeUrl = status ? getLiveCreditsUpgradeUrl( status, siteId, site ) : undefined;
	const access = upgradeAccess?.scope === scope ? upgradeAccess : undefined;
	// Upgrade only when checkout would accept it; everyone else is told who can buy, or nothing when the server can’t say.
	const upgradeUrl = access?.canUpgrade === true ? planUpgradeUrl : undefined;
	let askToUpgrade: 'site-admin' | 'plan-owner' | undefined;
	if ( planUpgradeUrl && access?.canBuyCredits === false ) {
		askToUpgrade = 'site-admin';
	} else if ( planUpgradeUrl && access?.canUpgrade === false ) {
		askToUpgrade = 'plan-owner';
	}
	// Mock and free balances send no events.
	liveCredits.current = siteId && status ? { status, siteId, agentConfig } : undefined;

	// A known balance draining to zero opens once; initial reads and new visits stay quiet.
	const wasExhaustedRef = useRef( { scope, hasBalance: !! status, isExhausted } );
	useEffect( () => {
		const previous = wasExhaustedRef.current;
		if (
			previous.scope === scope &&
			previous.hasBalance &&
			isExhausted &&
			! previous.isExhausted
		) {
			setIsPopoverOpen( true );
		}
		wasExhaustedRef.current = { scope, hasBalance: !! status, isExhausted };
	}, [ scope, status, isExhausted, setIsPopoverOpen ] );

	const handleAction = useCallback( () => {
		setIsPopoverOpen( false );
	}, [ setIsPopoverOpen ] );

	// Only the dot opens the popover by a click; opening on depletion above records nothing.
	const toggleMeter = useCallback(
		( open: boolean ) => {
			if ( open && ! isPopoverOpen ) {
				recordCreditsEvent( 'calypso_agents_manager_credits_meter_opened', { trigger: 'click' } );
			}
			setIsPopoverOpen( open );
		},
		[ isPopoverOpen, recordCreditsEvent, setIsPopoverOpen ]
	);

	let purchaseHint: string | undefined;
	if ( askToUpgrade === 'site-admin' ) {
		purchaseHint = __( 'Ask a site admin to add more.', __i18n_text_domain__ );
	} else if ( askToUpgrade === 'plan-owner' ) {
		purchaseHint = __(
			'This plan was purchased by a different WordPress.com account. To manage this plan, log in to that account or contact the account owner.',
			__i18n_text_domain__
		);
	}

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
				upgradeUrl={ upgradeUrl }
				purchaseHint={ purchaseHint }
			/>
		);
	}, [ status, isPopoverOpen, toggleMeter, handleAction, siteId, upgradeUrl, purchaseHint ] );

	const notice = useMemo< NoticeConfig | undefined >( () => {
		if ( siteId && status?.plan === 'paid' ) {
			const action = upgradeUrl
				? {
						label: __( 'Upgrade', __i18n_text_domain__ ),
						href: upgradeUrl,
						target: '_blank',
						rel: 'noopener noreferrer',
					}
				: undefined;
			// A dismissed low notice must not hide the exhausted state.
			if ( isExhausted ) {
				let message: string = __( 'You’ve used all your site credits.', __i18n_text_domain__ );
				if ( askToUpgrade === 'site-admin' ) {
					message = __(
						'You’ve used all your site credits. Ask a site admin to add more.',
						__i18n_text_domain__
					);
				} else if ( askToUpgrade === 'plan-owner' ) {
					message = __(
						'You’ve used all your site credits. Ask the plan owner to upgrade.',
						__i18n_text_domain__
					);
				}
				return { icon: false, message, action, dismissible: false };
			}
			if ( isLow && ! isLowNoticeDismissed ) {
				let message: string = sprintf(
					/* translators: %s: site credits left in short form, e.g. "800" or "8.5k" */
					_n( '%s credit left.', '%s credits left.', status.remaining, __i18n_text_domain__ ),
					formatCreditsShort( status.remaining )
				);
				if ( askToUpgrade === 'site-admin' ) {
					message = sprintf(
						/* translators: %s: site credits left in short form, e.g. "800" or "8.5k" */
						_n(
							'%s credit left. Ask a site admin to add more.',
							'%s credits left. Ask a site admin to add more.',
							status.remaining,
							__i18n_text_domain__
						),
						formatCreditsShort( status.remaining )
					);
				} else if ( askToUpgrade === 'plan-owner' ) {
					message = sprintf(
						/* translators: %s: site credits left in short form, e.g. "800" or "8.5k" */
						_n(
							'%s credit left. Ask the plan owner to upgrade.',
							'%s credits left. Ask the plan owner to upgrade.',
							status.remaining,
							__i18n_text_domain__
						),
						formatCreditsShort( status.remaining )
					);
				}
				return { icon: false, message, action, dismissible: true, onDismiss: dismissLowNotice };
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
		upgradeUrl,
		askToUpgrade,
		isExhausted,
		isLow,
		isLowNoticeDismissed,
		handleAction,
		dismissLowNotice,
	] );

	// Once per state for this site, user and agent, and only while the notice is drawn.
	const shownNoticeState: CreditsState | undefined =
		siteId && status && notice && isNoticeVisible ? getCreditsState( status ) : undefined;
	const userRole = getCreditsUserRole( access?.canBuyCredits );
	const ctaType = getCreditsCtaType( !! upgradeUrl, askToUpgrade );
	useEffect( () => {
		if ( ! shownNoticeState ) {
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
		} );
	}, [ shownNoticeState, scopeIdentity, userRole, ctaType, recordCreditsEvent ] );

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
		() => ( { chat, trailingActions, notice, beforeSubmit, takeRefusalCode } ),
		[ chat, trailingActions, notice, beforeSubmit, takeRefusalCode ]
	);
}
