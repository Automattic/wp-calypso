import { StatusIndicator } from '@automattic/agenttic-ui';
import { Button, Dropdown } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	type CreditsPool,
	type CreditsStatus,
	clampPercent,
	formatCreditsDetail,
	formatCreditsLeft,
	formatPercent,
	getCreditsLabel,
	getCreditsTone,
	isCreditsExhausted,
} from '../../utils/credits';
import './style.scss';

interface Props {
	status: CreditsStatus;
	isOpen: boolean;
	onToggle: ( willOpen: boolean ) => void;
	/** Mock CTA: Upgrade on free plans, Add credits on paid ones. */
	onAction?: () => void;
	/** Plans page for a live balance with a supported upgradeable tier. */
	upgradeUrl?: string;
	/** Shown instead of a CTA to people who can't buy for the site. */
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
					className={
						isExhausted
							? 'agents-manager-credits-meter__pool-percent is-exhausted'
							: 'agents-manager-credits-meter__pool-percent'
					}
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
 * The composer's credits indicator: a dot in the trailing slot, red when the
 * balance is low or used up, a tooltip on hover or focus, and a popover on
 * click listing each credit pool with a single CTA. The tooltip gives a paid
 * site's credits left as an amount and a free plan's as a percentage. Each
 * pool row leads with its percentage, except top-ups, which have no allowance
 * and show their balance alone.
 */
export default function CreditsMeter( {
	status,
	isOpen,
	onToggle,
	onAction,
	upgradeUrl,
	purchaseHint,
	manageUrl,
}: Props ) {
	const label = getCreditsLabel( status );
	const tone = getCreditsTone( status );
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
					icon={ <StatusIndicator tone={ tone } /> }
					iconSize={ 12 }
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
					{ ( upgradeUrl || onAction ) && (
						<Button
							className="agents-manager-credits-meter__cta"
							variant={ upgradeUrl || isFree ? 'primary' : 'secondary' }
							onClick={ onAction }
							href={ upgradeUrl }
							target={ upgradeUrl ? '_blank' : undefined }
							rel={ upgradeUrl ? 'noopener noreferrer' : undefined }
							__next40pxDefaultSize
						>
							{ upgradeUrl || isFree
								? __( 'Upgrade', __i18n_text_domain__ )
								: __( 'Add credits', __i18n_text_domain__ ) }
						</Button>
					) }
				</div>
			) }
		/>
	);
}
