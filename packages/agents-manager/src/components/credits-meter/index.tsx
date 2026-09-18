import { ProgressRing } from '@automattic/agenttic-ui';
import { Button, Dropdown } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	type CreditsPool,
	type CreditsStatus,
	clampPercent,
	formatCreditsDetail,
	getCreditsLabel,
	getCreditsTone,
	isCreditsExhausted,
} from '../../utils/credits';
import './style.scss';

interface Props {
	status: CreditsStatus;
	isOpen: boolean;
	onToggle: ( willOpen: boolean ) => void;
	/** Single CTA: Upgrade on free plans, Add credits on paid ones. */
	onAction?: () => void;
	/** Full balance and purchases page. The link renders regardless; it goes nowhere until the page exists. */
	manageUrl?: string;
}

function PoolRow( { pool, isExhausted }: { pool: CreditsPool; isExhausted: boolean } ) {
	const percent = clampPercent( pool.percent );
	const detail = formatCreditsDetail( pool );
	return (
		<div
			className="agents-manager-credits-meter__pool"
			role="group"
			aria-label={ sprintf(
				/* translators: 1: pool name, 2: percentage left, 3: reset or expiry date */
				__( '%1$s, %2$d%% left, %3$s', __i18n_text_domain__ ),
				pool.label,
				percent,
				pool.dateLabel ?? ''
			) }
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
								/* translators: %d: percentage of credits left */
								__( '%d%% left', __i18n_text_domain__ ),
								percent
						  )
						: `${ percent }%` }
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
export default function CreditsMeter( { status, isOpen, onToggle, onAction, manageUrl }: Props ) {
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
			// Render inside the panel so opening the popover doesn't blur it
			popoverProps={ { inline: true, placement: 'top-end', offset: 8 } }
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
				<div
					className="agents-manager-credits-meter__content"
					role="dialog"
					aria-label={ __( 'Site credits', __i18n_text_domain__ ) }
				>
					<div className="agents-manager-credits-meter__header">
						<span className="agents-manager-credits-meter__title">
							{ __( 'Site credits', __i18n_text_domain__ ) }
						</span>
						<Button
							className="agents-manager-credits-meter__manage"
							variant="link"
							href={ manageUrl }
							target={ manageUrl ? '_blank' : undefined }
						>
							{ __( 'Manage', __i18n_text_domain__ ) }
						</Button>
					</div>
					{ status.pools.map( ( pool ) => (
						<PoolRow key={ pool.id } pool={ pool } isExhausted={ isFree && isExhausted } />
					) ) }
					{ isFree && isExhausted && (
						<p className="agents-manager-credits-meter__message">
							{ __( 'You’ve used all your free credits.', __i18n_text_domain__ ) }
						</p>
					) }
					{ onAction && (
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
