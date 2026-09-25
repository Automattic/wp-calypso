import { ProgressRing } from '@automattic/agenttic-ui';
import { Button, Dropdown } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	type CreditsPool,
	type CreditsStatus,
	clampPercent,
	formatCreditsDetail,
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
	/** Full balance and purchases page, when available. */
	manageUrl?: string;
}

function PoolRow( { pool, isExhausted }: { pool: CreditsPool; isExhausted: boolean } ) {
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
			{ detail && <div className="agents-manager-credits-meter__pool-detail">{ detail }</div> }
		</div>
	);
}

/**
 * The composer's credits indicator: a ring in the trailing slot, a tooltip
 * on hover or focus, and a popover on click listing each credit pool with a
 * single CTA. Percent stays the primary figure everywhere; exact credits are
 * popover detail only.
 */
export default function CreditsMeter( {
	status,
	isOpen,
	onToggle,
	onAction,
	upgradeUrl,
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
			// Render inside the panel so opening the popover doesn't blur it
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
					icon={ <ProgressRing percent={ status.percent } tone={ tone } /> }
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
					{ status.pools.map( ( pool ) => (
						<PoolRow key={ pool.id } pool={ pool } isExhausted={ isFree && isExhausted } />
					) ) }
					{ isFree && isExhausted && (
						<p className="agents-manager-credits-meter__message">
							{ __( 'You’ve used all your free credits.', __i18n_text_domain__ ) }
						</p>
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
