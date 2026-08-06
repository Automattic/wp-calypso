import { Notice, QuestionCard } from '@automattic/agenttic-ui';
import { useSyncExternalStore } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { AI } from '../icons';
import {
	getFreeCreditsState,
	subscribeToFreeCredits,
	type FreeCreditsState,
	type FreeCreditsSurface,
} from './store';
import './style.scss';

export {
	consumeFreeCredit,
	registerFreeCreditsExperimentApi,
	resetFreeCredits,
	setFreeCreditsState,
	FREE_CREDITS_SURFACES,
} from './store';
export type { FreeCreditsState, FreeCreditsSurface } from './store';

interface FreeCredits extends FreeCreditsState {
	isExhausted: boolean;
	isLow: boolean;
	hasSurface: ( surface: FreeCreditsSurface ) => boolean;
}

/** Below this share of the allowance the surfaces switch to their warning tone. */
const LOW_BALANCE_RATIO = 0.25;

const noop = () => {};

export function useFreeCredits(): FreeCredits {
	const state = useSyncExternalStore(
		subscribeToFreeCredits,
		getFreeCreditsState,
		getFreeCreditsState
	);

	return {
		...state,
		isExhausted: state.enabled && state.remaining <= 0,
		isLow:
			state.enabled && state.remaining > 0 && state.remaining / state.total <= LOW_BALANCE_RATIO,
		hasSurface: ( surface ) => state.enabled && state.surfaces.includes( surface ),
	};
}

interface UpgradeProps {
	onUpgrade?: () => void;
}

function upgradeAction( onUpgrade?: () => void ) {
	return { label: __( 'Upgrade', __i18n_text_domain__ ), onClick: onUpgrade ?? noop };
}

function balanceStatus( { isExhausted, isLow }: Pick< FreeCredits, 'isExhausted' | 'isLow' > ) {
	if ( isExhausted ) {
		return 'error' as const;
	}
	return isLow ? ( 'warning' as const ) : undefined;
}

/**
 * Compact balance chip for the chat header. Carries no copy beyond the count,
 * so it relies on its tooltip to explain what the number is.
 */
export function FreeCreditsPill() {
	const { remaining, total, isExhausted, isLow, hasSurface } = useFreeCredits();

	if ( ! hasSurface( 'pill' ) ) {
		return null;
	}

	return (
		<span
			className={ clsx( 'agents-manager-free-credits-pill', {
				'is-low': isLow,
				'is-exhausted': isExhausted,
			} ) }
			title={ sprintf(
				/* translators: %1$d is the remaining free AI requests, %2$d the monthly allowance. */
				__( '%1$d of %2$d free requests left this month', __i18n_text_domain__ ),
				remaining,
				total
			) }
		>
			<AI size={ 16 } />
			<span className="agents-manager-free-credits-pill__count">{ remaining }</span>
		</span>
	);
}

/**
 * Persistent balance strip above the composer, using the chat's own notice
 * treatment. Yields to `FreeCreditsExhausted` at zero.
 */
export function FreeCreditsBanner( { onUpgrade }: UpgradeProps ) {
	const { remaining, total, isExhausted, isLow, hasSurface } = useFreeCredits();

	if ( ! hasSurface( 'banner' ) || ( isExhausted && hasSurface( 'exhausted' ) ) ) {
		return null;
	}

	return (
		<Notice
			className="agents-manager-free-credits-banner"
			status={ balanceStatus( { isExhausted, isLow } ) }
			icon={ <AI size={ 16 } /> }
			message={
				isExhausted
					? __( 'No free requests left this month.', __i18n_text_domain__ )
					: sprintf(
							/* translators: %1$d is the remaining free AI requests, %2$d the monthly allowance. */
							__( '%1$d of %2$d free requests left', __i18n_text_domain__ ),
							remaining,
							total
					  )
			}
			action={ upgradeAction( onUpgrade ) }
		/>
	);
}

/**
 * Empty-view card that states the allowance before the first message, where
 * there is room for a full sentence. Built on the chat's own question card so
 * the frame and the action match every other card in the conversation.
 */
export function FreeCreditsCard( { onUpgrade }: UpgradeProps ) {
	const { remaining, isExhausted, hasSurface } = useFreeCredits();

	if ( ! hasSurface( 'card' ) ) {
		return null;
	}

	return (
		<QuestionCard
			className="agents-manager-free-credits-card"
			prompt={ {
				question: isExhausted
					? __( 'You’ve used all your free requests', __i18n_text_domain__ )
					: sprintf(
							/* translators: %d is the number of free AI requests remaining. */
							__( '%d free requests left', __i18n_text_domain__ ),
							remaining
					  ),
				choices: [
					{
						label: __( 'Upgrade Jetpack AI', __i18n_text_domain__ ),
						description: isExhausted
							? __(
									'Keep going now — your free allowance also refreshes next month.',
									__i18n_text_domain__
							  )
							: __(
									'Every request across Jetpack’s AI-powered features draws from this monthly allowance.',
									__i18n_text_domain__
							  ),
					},
				],
			} }
			onAnswer={ () => onUpgrade?.() }
		/>
	);
}

/**
 * Zero-balance gate above the composer. This is the conversion moment, so it
 * takes the chat's error notice rather than the neutral balance strip.
 */
export function FreeCreditsExhausted( { onUpgrade }: UpgradeProps ) {
	const { isExhausted, hasSurface } = useFreeCredits();

	if ( ! hasSurface( 'exhausted' ) || ! isExhausted ) {
		return null;
	}

	return (
		<Notice
			className="agents-manager-free-credits-exhausted"
			status="error"
			icon={ <AI size={ 16 } /> }
			message={ __(
				'You’re out of free requests. Upgrade to keep chatting.',
				__i18n_text_domain__
			) }
			action={ upgradeAction( onUpgrade ) }
		/>
	);
}
