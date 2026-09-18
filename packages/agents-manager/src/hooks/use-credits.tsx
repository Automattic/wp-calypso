import { useCallback, useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import CreditsMeter from '../components/credits-meter';
import {
	type CreditsPlan,
	type CreditsStatus,
	clampPercent,
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

function buildMockStatus( plan: CreditsPlan, percent: number ): CreditsStatus {
	if ( plan === 'paid' ) {
		return {
			plan,
			percent,
			pools: [
				{
					id: 'plan',
					label: __( 'Monthly plan', __i18n_text_domain__ ),
					percent,
					dateLabel: __( 'Resets 17 Oct', __i18n_text_domain__ ),
					remaining: Math.round( ( 15000 * percent ) / 100 ),
					total: 15000,
				},
				{
					id: 'topups',
					label: __( 'Top-ups', __i18n_text_domain__ ),
					percent: 80,
					dateLabel: __( 'Expires 15 Sep 2027', __i18n_text_domain__ ),
					remaining: 800,
					total: 1000,
				},
			],
		};
	}

	return {
		plan,
		percent,
		pools: [ { id: 'free', label: __( 'Free credits', __i18n_text_domain__ ), percent } ],
	};
}

interface UseCreditsOptions {
	/** Surfaces without metering (Reader chat) pass false and get nothing. */
	enabled: boolean;
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
export function useCredits( { enabled }: UseCreditsOptions ): UseCreditsResult {
	const [ seed ] = useState( readMockSeed );
	const [ percent, setPercent ] = useState( seed?.percent ?? 0 );
	const [ isLowNoticeDismissed, setIsLowNoticeDismissed ] = useState( false );
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	const status = useMemo(
		() => ( enabled && seed ? buildMockStatus( seed.plan, percent ) : undefined ),
		[ enabled, seed, percent ]
	);

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

		setPercent( ( current ) => Math.max( 0, current - MOCK_COST_PER_MESSAGE ) );

		return true;
	}, [ status, isExhausted ] );

	return { trailingActions, notice, beforeSubmit };
}
