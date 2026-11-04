import { ProgressRing } from '@automattic/agenttic-ui';
import { Button, Dropdown } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import {
	type CreditsPool,
	type CreditsStatus,
	clampPercent,
	formatCreditsDetail,
	formatCreditsLeft,
	formatPercent,
	getCreditsLabel,
	getCreditsRingPercent,
	getCreditsToggleLabel,
	isCreditsExhausted,
} from '../../utils/credits';
import type { CreditsPurchaseAction } from '../../utils/credits-access';
import './style.scss';

interface Props {
	status: CreditsStatus;
	isOpen: boolean;
	onToggle: ( willOpen: boolean ) => void;
	/** Mock CTA: Upgrade on free plans, Add credits on paid ones. */
	onAction?: () => void;
	/** The live balance's Upgrade or Add credits link. */
	action?: CreditsPurchaseAction;
	/** Shown instead of a CTA to people who can't buy for the site themselves. */
	purchaseHint?: string;
	/** Full balance and purchases page, when available. */
	manageUrl?: string;
}

function PoolRow( { pool, isExhausted }: { pool: CreditsPool; isExhausted: boolean } ) {
	// Top-ups have no allowance or reset, so the row shows their balance, never the exhausted style.
	if ( pool.id === 'topups' ) {
		const balance = formatCreditsLeft( pool.remaining );
		return (
			<div
				className="agents-manager-credits-meter__pool is-balance-only"
				role="group"
				aria-label={ sprintf(
					/* translators: 1: pool name, 2: credits left in the pool, e.g. "67k credits left" */
					__( '%1$s, %2$s', __i18n_text_domain__ ),
					pool.label,
					balance
				) }
			>
				<div className="agents-manager-credits-meter__pool-header">
					<span className="agents-manager-credits-meter__pool-label">{ pool.label }</span>
					<span className="agents-manager-credits-meter__pool-balance">{ balance }</span>
				</div>
			</div>
		);
	}
	const percent = clampPercent( pool.percent );
	const percentLabel = formatPercent( pool.percent );
	const detail = formatCreditsDetail( pool );
	return (
		<div
			className="agents-manager-credits-meter__pool"
			role="group"
			aria-label={
				pool.dateLabel
					? sprintf(
							/* translators: 1: pool name, 2: percentage left, 3: reset or expiry date */
							__( '%1$s, %2$s%% left, %3$s', __i18n_text_domain__ ),
							pool.label,
							percentLabel,
							pool.dateLabel
						)
					: sprintf(
							/* translators: 1: pool name, 2: percentage left */
							__( '%1$s, %2$s%% left', __i18n_text_domain__ ),
							pool.label,
							percentLabel
						)
			}
		>
			<div className="agents-manager-credits-meter__pool-header">
				<span className="agents-manager-credits-meter__pool-label">{ pool.label }</span>
				{ pool.dateLabel && (
					<span className="agents-manager-credits-meter__pool-date">{ pool.dateLabel }</span>
				) }
				<span
					className={ clsx( 'agents-manager-credits-meter__pool-percent', {
						'is-exhausted': isExhausted,
					} ) }
				>
					{ isExhausted
						? sprintf(
								/* translators: %s: percentage of credits left, e.g. "0" */
								__( '%s%% left', __i18n_text_domain__ ),
								percentLabel
							)
						: sprintf(
								/* translators: %s: percentage of credits left, e.g. "72" or "<1" */
								__( '%s%%', __i18n_text_domain__ ),
								percentLabel
							) }
				</span>
			</div>
			<div className="agents-manager-credits-meter__bar" aria-hidden="true">
				<div
					className="agents-manager-credits-meter__bar-fill"
					style={ { width: `${ percent }%` } }
				/>
			</div>
			{ detail && ! isExhausted && (
				<div className="agents-manager-credits-meter__pool-detail">{ detail }</div>
			) }
		</div>
	);
}

/**
 * The composer's credits toggle and popover. The ring shows this period's plan or free credits
 * left, so it empties at 0 while top-ups still pay. The tooltip and the popover's total give the
 * combined balance.
 */
export default function CreditsMeter( {
	status,
	isOpen,
	onToggle,
	onAction,
	action,
	purchaseHint,
	manageUrl,
}: Props ) {
	const label = getCreditsToggleLabel( status );
	const ringPercent = getCreditsRingPercent( status );
	const isExhausted = isCreditsExhausted( status );
	const isFree = status.plan === 'free';

	return (
		<Dropdown
			className="agents-manager-credits-meter"
			contentClassName="agents-manager-credits-meter__popover"
			open={ isOpen }
			onToggle={ onToggle }
			focusOnMount
			// Render inside the panel node so the popover stacks with the panel
			popoverProps={ {
				inline: true,
				placement: 'top-end',
				offset: 8,
				role: 'dialog',
				'aria-label': __( 'Site credits', __i18n_text_domain__ ),
			} }
			renderToggle={ ( { onToggle: toggle } ) => (
				<Button
					className="agents-manager-credits-meter__toggle"
					icon={
						<ProgressRing
							percent={ ringPercent }
							tone="muted"
							className={ clsx( 'agents-manager-credits-meter__ring', {
								'agents-manager-credits-meter__ring--empty': ringPercent === 0,
							} ) }
						/>
					}
					iconSize={ 16 }
					label={ label }
					showTooltip={ ! isOpen }
					aria-expanded={ isOpen }
					aria-haspopup="dialog"
					onClick={ toggle }
					size="compact"
				/>
			) }
			renderContent={ () => (
				<div className="agents-manager-credits-meter__content">
					<div className="agents-manager-credits-meter__header">
						<span className="agents-manager-credits-meter__title">
							{ __( 'Site credits', __i18n_text_domain__ ) }
						</span>
						{ manageUrl && (
							<Button
								className="agents-manager-credits-meter__manage"
								variant="link"
								href={ manageUrl }
								target="_blank"
							>
								{ __( 'Manage', __i18n_text_domain__ ) }
							</Button>
						) }
					</div>
					<p className="agents-manager-credits-meter__total">{ getCreditsLabel( status ) }</p>
					{ status.pools.map( ( pool ) => (
						<PoolRow key={ pool.id } pool={ pool } isExhausted={ isExhausted } />
					) ) }
					{ isExhausted && (
						<p className="agents-manager-credits-meter__message">
							{ isFree
								? __( 'You’ve used all your free credits.', __i18n_text_domain__ )
								: __( 'You’ve used all your site credits.', __i18n_text_domain__ ) }
						</p>
					) }
					{ purchaseHint && (
						<p className="agents-manager-credits-meter__message">{ purchaseHint }</p>
					) }
					{ action && (
						<Button
							className="agents-manager-credits-meter__cta"
							variant="primary"
							onClick={ action.onClick }
							href={ action.href }
							target={ action.target }
							rel={ action.rel }
							__next40pxDefaultSize
						>
							{ action.label }
						</Button>
					) }
					{ ! action && onAction && (
						<Button
							className="agents-manager-credits-meter__cta"
							variant={ isFree ? 'primary' : 'secondary' }
							onClick={ onAction }
							__next40pxDefaultSize
						>
							{ isFree
								? __( 'Upgrade', __i18n_text_domain__ )
								: __( 'Add credits', __i18n_text_domain__ ) }
						</Button>
					) }
				</div>
			) }
		/>
	);
}
