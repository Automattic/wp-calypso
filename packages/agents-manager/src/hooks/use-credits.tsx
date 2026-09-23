import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import CreditsMeter from '../components/credits-meter';
import {
	type CreditsPlan,
	buildMockCreditsStatus,
	clampPercent,
	formatPercent,
	isCreditsExhausted,
	isCreditsLow,
} from '../utils/credits';
import type { NoticeConfig, TrailingActions } from '@automattic/agenttic-ui';

interface MockCreditsSeed {
	plan: CreditsPlan;
	percent: number;
}

// Each sent message spends this much of the balance in the mock.
const MOCK_COST_PER_MESSAGE = 5;

/**
 * Mock source until the backend snapshot lands: `?am_credits=55&am_plan=free`
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
	/** The agent request state; the mock spends when a request finishes. */
	isProcessing: boolean;
}

interface UseCreditsResult {
	/** Ring + popover for the composer's trailing slot; undefined when credits don't apply. */
	trailingActions?: TrailingActions;
	/** Low (free, one-time, dismissible) or exhausted (persistent) notice. */
	notice?: NoticeConfig;
	/** Blocks Send and suggestions at zero, keeping the typed text. */
	beforeSubmit: () => boolean;
}

/**
 * Implements the credits meter mechanism: balance state, the ring in the
 * composer, low/exhausted notices, submit gating at zero, and the upsell
 * popover. One hook so the pieces stay together when the mock source is
 * replaced by the backend snapshot.
 */
export function useCredits( { enabled, isProcessing }: UseCreditsOptions ): UseCreditsResult {
	const [ seed ] = useState( readMockSeed );
	const [ percent, setPercent ] = useState( seed?.percent ?? 0 );
	const [ isLowNoticeDismissed, setIsLowNoticeDismissed ] = useState( false );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	// Spend once a request has actually run, not on the submit attempt: sends
	// dropped before dispatch (upload failure, re-entry) never touch the agent's
	// processing state, so they cost nothing. The real snapshot arrives the
	// same way, on the terminal response.
	const wasProcessingRef = useRef( isProcessing );
	useEffect( () => {
		if ( wasProcessingRef.current && ! isProcessing && enabled && seed ) {
			setPercent( ( current ) => Math.max( 0, current - MOCK_COST_PER_MESSAGE ) );
		}
		wasProcessingRef.current = isProcessing;
	}, [ isProcessing, enabled, seed ] );

	const status = useMemo(
		() => ( enabled && seed ? buildMockCreditsStatus( seed.plan, percent ) : undefined ),
		[ enabled, seed, percent ]
	);

	const isExhausted = status ? isCreditsExhausted( status ) : false;
	const isLow = status ? isCreditsLow( status ) : false;

	// The popover opens once, on its own, when a reply drains the balance to
	// zero: sends are blocked from that point, so the user learns before
	// trying. Seeded at the current state so a chat that mounts already
	// exhausted stays quiet until they act.
	const wasExhaustedRef = useRef( isExhausted );
	useEffect( () => {
		if ( isExhausted && ! wasExhaustedRef.current ) {
			setIsPopoverOpen( true );
		}
		wasExhaustedRef.current = isExhausted;
	}, [ isExhausted ] );

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
				onAction={ handleAction }
			/>
		);
	}, [ status, isPopoverOpen, handleAction ] );

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
					/* translators: %s: percentage of free credits left, e.g. "15" or "<1" */
					__( '%s%% of free credits left.', __i18n_text_domain__ ),
					formatPercent( status.percent )
				),
				action: { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: handleAction },
				dismissible: true,
				onDismiss: () => setIsLowNoticeDismissed( true ),
			};
		}

		return undefined;
	}, [ status, isExhausted, isLow, isLowNoticeDismissed, handleAction ] );

	// At zero, on any plan, the popover opens instead of running (Upgrade on
	// free, Add credits on paid); the mock spends otherwise.
	const beforeSubmit = useCallback( () => {
		if ( ! status ) {
			return true;
		}

		if ( isExhausted ) {
			setIsPopoverOpen( true );
			return false;
		}

		return true;
	}, [ status, isExhausted ] );

	return useMemo(
		() => ( { trailingActions, notice, beforeSubmit } ),
		[ trailingActions, notice, beforeSubmit ]
	);
}
