import { PLAN_PREMIUM, PLAN_PREMIUM_MONTHLY } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import QueryPlans from 'calypso/components/data/query-plans';
import { useSelector } from 'calypso/state';
import { getPlanBySlug } from 'calypso/state/plans/selectors';

import './style.scss';

export default function StatsUpsellModal( {
	onClose,
	onSubmit,
}: {
	onClose: () => void;
	onSubmit: () => void;
} ) {
	const translate = useTranslate();
	const plan = useSelector( ( state ) => getPlanBySlug( state, PLAN_PREMIUM ) );
	const planMonthly = useSelector( ( state ) => getPlanBySlug( state, PLAN_PREMIUM_MONTHLY ) );
	const planName = plan?.product_name_short ?? '';
	const isLoading = ! plan || ! planMonthly;
	return (
		<Modal
			className="stats-upsell-modal"
			onRequestClose={ onClose }
			shouldCloseOnClickOutside={ false }
			__experimentalHideHeader={ true }
		>
			<QueryPlans />
			<Button
				className="stats-upsell-modal__close-button"
				onClick={ onClose }
				icon={ close }
				label={ translate( 'Close' ) }
			/>
			<div className="stats-upsell-modal__content">
				<div className="stats-upsell-modal__left">
					<div className="stats-upsell-modal__title">
						{ translate( 'Grow faster with Advanced Stats' ) }
					</div>
					<div className="stats-upsell-modal__text">
						{ translate( 'Finesse your scaling up strategy with detailed insights and data.' ) }
					</div>
					<Button variant="primary" className="stats-upsell-modal__button" onClick={ onSubmit }>
						{ translate( 'Upgrade to %(planName)s', { args: { planName } } ) }
					</Button>
				</div>
				<div className="stats-upsell-modal__right">
					<h2 className="stats-upsell-modal__plan">
						{ isLoading ? '' : translate( '%(planName)s plan', { args: { planName } } ) }
					</h2>
					{ ! isLoading && (
						<div
							className="stats-upsell-modal__price-amount"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ { __html: planMonthly?.product_display_price ?? '' } }
						></div>
					) }
					<div className="stats-upsell-modal__price-per-month">
						{ isLoading
							? ''
							: translate( 'per month, %(planPrice)s billed yearly', {
									args: { planPrice: plan?.formatted_price ?? '' },
							  } ) }
					</div>
					<div className="stats-upsell-modal__features">
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" />
							<div className="stats-upsell-modal__feature-text">
								{ translate(
									'All stats available: traffic trends, sources, optimal time to post…'
								) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" />
							<div className="stats-upsell-modal__feature-text">
								{ translate( 'Download data as CSV' ) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" />
							<div className="stats-upsell-modal__feature-text">
								{ translate( 'Instant access to upcoming features' ) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" />
							<div className="stats-upsell-modal__feature-text">
								{ translate( '14-day money back guarantee' ) }
							</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
