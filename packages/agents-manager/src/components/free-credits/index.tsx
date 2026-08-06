import { Button } from '@wordpress/components';
import { useSyncExternalStore } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, cautionFilled } from '@wordpress/icons';
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

function UpgradeButton( {
	onUpgrade,
	variant = 'primary',
}: UpgradeProps & { variant?: 'primary' | 'link' } ) {
	return (
		<Button
			className="agents-manager-free-credits__upgrade"
			variant={ variant }
			size="small"
			onClick={ onUpgrade }
		>
			{ __( 'Upgrade', __i18n_text_domain__ ) }
		</Button>
	);
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
 * Persistent strip above the composer. Steps down to a warning tone as the
 * balance runs low, and yields to `FreeCreditsExhausted` at zero.
 */
export function FreeCreditsBanner( { onUpgrade }: UpgradeProps ) {
	const { remaining, total, isExhausted, isLow, hasSurface } = useFreeCredits();

	if ( ! hasSurface( 'banner' ) || ( isExhausted && hasSurface( 'exhausted' ) ) ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'agents-manager-free-credits-banner', {
				'is-low': isLow,
				'is-exhausted': isExhausted,
			} ) }
		>
			<span className="agents-manager-free-credits-banner__label">
				{ isExhausted
					? __( 'No free requests left this month.', __i18n_text_domain__ )
					: sprintf(
							/* translators: %1$d is the remaining free AI requests, %2$d the monthly allowance. */
							__( '%1$d of %2$d free requests left', __i18n_text_domain__ ),
							remaining,
							total
					  ) }
			</span>
			<UpgradeButton onUpgrade={ onUpgrade } variant="link" />
		</div>
	);
}

/**
 * Empty-view card that states the allowance before the first message, where
 * there is room for a meter and a full sentence.
 */
export function FreeCreditsCard( { onUpgrade }: UpgradeProps ) {
	const { remaining, total, isExhausted, isLow, hasSurface } = useFreeCredits();

	if ( ! hasSurface( 'card' ) ) {
		return null;
	}

	const usedRatio = total > 0 ? ( total - remaining ) / total : 1;

	return (
		<section
			className={ clsx( 'agents-manager-free-credits-card', {
				'is-low': isLow,
				'is-exhausted': isExhausted,
			} ) }
		>
			<header className="agents-manager-free-credits-card__header">
				<AI size={ 20 } />
				<h3 className="agents-manager-free-credits-card__title">
					{ isExhausted
						? __( 'You’ve used all your free requests', __i18n_text_domain__ )
						: sprintf(
								/* translators: %d is the number of free AI requests remaining. */
								__( '%d free requests left', __i18n_text_domain__ ),
								remaining
						  ) }
				</h3>
			</header>
			<div
				className="agents-manager-free-credits-card__meter"
				role="progressbar"
				aria-valuemin={ 0 }
				aria-valuemax={ total }
				aria-valuenow={ remaining }
				aria-label={ __( 'Free requests remaining', __i18n_text_domain__ ) }
			>
				<div
					className="agents-manager-free-credits-card__meter-fill"
					style={ { inlineSize: `${ Math.round( usedRatio * 100 ) }%` } }
				/>
			</div>
			<p className="agents-manager-free-credits-card__description">
				{ isExhausted
					? __(
							'Upgrade Jetpack AI to keep going — your allowance also refreshes next month.',
							__i18n_text_domain__
					  )
					: __(
							'Every request across Jetpack’s AI-powered features draws from this monthly allowance.',
							__i18n_text_domain__
					  ) }
			</p>
			<UpgradeButton onUpgrade={ onUpgrade } />
		</section>
	);
}

/**
 * Zero-balance gate rendered in place of the composer. This is the conversion
 * moment, so it takes the full footer rather than sharing it with the input.
 */
export function FreeCreditsExhausted( { onUpgrade }: UpgradeProps ) {
	const { isExhausted, hasSurface } = useFreeCredits();

	if ( ! hasSurface( 'exhausted' ) || ! isExhausted ) {
		return null;
	}

	return (
		<div className="agents-manager-free-credits-exhausted" role="status">
			<Icon className="agents-manager-free-credits-exhausted__icon" icon={ cautionFilled } />
			<div className="agents-manager-free-credits-exhausted__body">
				<p className="agents-manager-free-credits-exhausted__title">
					{ __( 'You’re out of free requests', __i18n_text_domain__ ) }
				</p>
				<p className="agents-manager-free-credits-exhausted__description">
					{ __(
						'Upgrade Jetpack AI to keep chatting, or wait for your allowance to refresh next month.',
						__i18n_text_domain__
					) }
				</p>
			</div>
			<UpgradeButton onUpgrade={ onUpgrade } />
		</div>
	);
}
