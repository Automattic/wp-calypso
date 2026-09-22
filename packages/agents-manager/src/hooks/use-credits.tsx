import { useAgentChat } from '@automattic/agenttic-client';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import CreditsMeter from '../components/credits-meter';
import { API_BASE_URL } from '../constants';
import { NO_SITE } from '../utils/agent-session';
import {
	type CreditsPlan,
	buildMockCreditsStatus,
	clampPercent,
	isCreditsExhausted,
	isCreditsLow,
} from '../utils/credits';
import {
	buildLiveCreditsStatus,
	getLiveCreditSiteId,
	parseCreditSnapshot,
} from '../utils/live-credits';
import type { CreditSnapshot } from '../utils/live-credits';
import type {
	TaskUpdate,
	UseAgentChatConfig,
	UseAgentChatReturn,
} from '@automattic/agenttic-client';
import type { NoticeConfig, TrailingActions } from '@automattic/agenttic-ui';

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

interface UseCreditsOptions {
	/** Surfaces without metering (Reader chat) pass false and get nothing. */
	enabled: boolean;
	agentConfig: UseAgentChatConfig;
	siteKey: string;
	userId?: number;
	isOpen: boolean;
}

interface UseCreditsResult {
	chat: UseAgentChatReturn;
	/** Ring + popover; hidden until this site returns valid allowance metadata. */
	trailingActions?: TrailingActions;
	/** Low (free, one-time, dismissible) or exhausted (persistent) notice. */
	notice?: NoticeConfig;
	/** Blocks Send and suggestions at zero, keeping the typed text. */
	beforeSubmit: () => boolean;
}

/**
 * Loads balances independently of prompts and keeps reads and terminal updates
 * scoped to the current site visit. The chat is composed here so refreshes can
 * avoid reading usage while a task is still running.
 */
export function useCredits( {
	enabled,
	agentConfig,
	siteKey,
	userId,
	isOpen,
}: UseCreditsOptions ): UseCreditsResult {
	const isMockEnabled = enabled && siteKey === NO_SITE;
	const siteId = enabled ? getLiveCreditSiteId( siteKey, agentConfig ) : undefined;
	const scopeIdentity = JSON.stringify( [ siteKey, userId, agentConfig.agentId, enabled ] );
	const scope = useMemo(
		() => ( { identity: scopeIdentity, siteId, active: true, validTerminalRevision: 0 } ),
		[ scopeIdentity, siteId ]
	);
	const currentScope = useRef( scope );
	currentScope.current = scope;
	const balanceRequest = useRef< AbortController | undefined >( undefined );
	const [ balance, setBalance ] = useState< { scope: typeof scope; snapshot: CreditSnapshot } >();
	const [ seed ] = useState( readMockSeed );
	const [ percent, setPercent ] = useState( seed?.percent ?? 0 );
	const [ isLowNoticeDismissed, setIsLowNoticeDismissed ] = useState( false );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );
	const invalidateBalance = useCallback( () => {
		if ( currentScope.current === scope && scope.active ) {
			setBalance( undefined );
			setIsPopoverOpen( false );
		}
	}, [ scope ] );
	const observeTaskUpdate = useCallback(
		( update: TaskUpdate ) => {
			if (
				! scope.active ||
				currentScope.current !== scope ||
				! scope.siteId ||
				update.final === false ||
				! ( update.final || [ 'completed', 'failed', 'canceled' ].includes( update.status.state ) )
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
	const chatConfig = useMemo(
		() => ( {
			...agentConfig,
			onTaskUpdate: async ( update: TaskUpdate ) => {
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
	const { authProvider } = agentConfig;
	const refreshBalance = useCallback( async () => {
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
	}, [ scope, authProvider, isOpen, invalidateBalance ] );
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

	const handleAction = useCallback( () => {
		// TODO: route to the plan upgrade / add-credits checkout once the CTA destination is decided.
		setIsPopoverOpen( false );
	}, [] );

	const trailingActions = useMemo< TrailingActions | undefined >( () => {
		if ( ! status ) {
			return undefined;
		}
		return (
			<CreditsMeter
				status={ status }
				isOpen={ isPopoverOpen }
				onToggle={ setIsPopoverOpen }
				onAction={ siteId ? undefined : handleAction }
			/>
		);
	}, [ status, isPopoverOpen, handleAction, siteId ] );

	const notice = useMemo< NoticeConfig | undefined >( () => {
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
					/* translators: %d: percentage of free credits left */
					__( '%d%% of free credits left.', __i18n_text_domain__ ),
					clampPercent( status.percent )
				),
				action: { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: handleAction },
				dismissible: true,
				onDismiss: () => setIsLowNoticeDismissed( true ),
			};
		}

		return undefined;
	}, [ status, isExhausted, isLow, isLowNoticeDismissed, handleAction ] );

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
			setIsPopoverOpen( true );
			return false;
		}

		return true;
	}, [ status, isExhausted, snapshot, invalidateBalance, refreshBalance ] );

	return useMemo(
		() => ( { chat, trailingActions, notice, beforeSubmit } ),
		[ chat, trailingActions, notice, beforeSubmit ]
	);
}
