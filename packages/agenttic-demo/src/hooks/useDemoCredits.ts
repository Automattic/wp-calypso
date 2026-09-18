import { useCallback, useMemo, useState } from 'react';
import type { NoticeConfig, ProgressRingTone } from '@automattic/agenttic-ui';

export type DemoCreditsPlan = 'free' | 'paid' | 'none';

const LOW_THRESHOLD = 20;
// Each sent message spends this much, so the ring visibly ticks down.
const COST_PER_MESSAGE = 5;

const clampPercent = ( value: number ) => Math.min( 100, Math.max( 0, value ) );

function readInitialState(): { plan: DemoCreditsPlan; percent: number } {
	const params = new URLSearchParams( window.location.search );
	const plan = params.get( 'plan' );
	const percent = Number( params.get( 'credits' ) );
	return {
		plan: plan === 'free' || plan === 'paid' ? plan : 'none',
		percent: Number.isFinite( percent ) && params.has( 'credits' ) ? clampPercent( percent ) : 55,
	};
}

/**
 * Mocked credit state for the playground: a plan and a percentage, spent on
 * every submit, plus the composer pieces the library provides (ring tone,
 * low/out notices, submit gating). The full credits meter with tooltip and
 * popover lives in the host (Agents Manager); the demo only shows the ring in
 * the trailing slot. Seed it from the URL with `?plan=free&credits=15`.
 */
export function useDemoCredits() {
	const [ initial ] = useState( readInitialState );
	const [ plan, setPlan ] = useState< DemoCreditsPlan >( initial.plan );
	const [ percent, setPercent ] = useState( initial.percent );
	const [ isLowNoticeDismissed, setIsLowNoticeDismissed ] = useState( false );

	const isFree = plan === 'free';
	const isOut = isFree && percent <= 0;
	const isLow = isFree && ! isOut && percent <= LOW_THRESHOLD;

	const upgrade = useCallback( () => {
		// eslint-disable-next-line no-console
		console.log( '[demo] Upgrade clicked' );
	}, [] );

	let tone: ProgressRingTone = 'primary';
	if ( plan === 'paid' ) {
		tone = 'muted';
	} else if ( isLow || isOut ) {
		tone = 'error';
	}

	const label =
		plan === 'paid'
			? `${ percent }% of monthly credits left`
			: `${ percent }% of free credits left`;

	const notice = useMemo< NoticeConfig | undefined >( () => {
		if ( isOut ) {
			return {
				icon: false,
				message: 'You’re out of free credits.',
				action: { label: 'Upgrade', onClick: upgrade },
				dismissible: false,
			};
		}
		if ( isLow && ! isLowNoticeDismissed ) {
			return {
				icon: false,
				message: `${ percent }% of free credits left.`,
				action: { label: 'Upgrade', onClick: upgrade },
				dismissible: true,
				onDismiss: () => setIsLowNoticeDismissed( true ),
			};
		}
		return undefined;
	}, [ isOut, isLow, isLowNoticeDismissed, percent, upgrade ] );

	// Out of credits: Send and suggestions are blocked and the text stays put.
	const beforeSubmit = useCallback( () => {
		if ( isOut ) {
			// eslint-disable-next-line no-console
			console.log( '[demo] Submit blocked: out of credits' );
			return false;
		}
		if ( plan !== 'none' ) {
			setPercent( ( current ) => Math.max( 0, current - COST_PER_MESSAGE ) );
		}
		return true;
	}, [ isOut, plan ] );

	const changePlan = useCallback( ( next: DemoCreditsPlan ) => {
		setPlan( next );
		setIsLowNoticeDismissed( false );
	}, [] );

	const changePercent = useCallback( ( next: number ) => {
		setPercent( clampPercent( next ) );
		setIsLowNoticeDismissed( false );
	}, [] );

	return { plan, percent, tone, label, changePlan, changePercent, notice, beforeSubmit };
}
