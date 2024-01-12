import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PREMIUM, PLAN_PREMIUM_MONTHLY } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { Button, Modal } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useSelector } from 'calypso/state';
import { getPlanBySlug } from 'calypso/state/plans/selectors';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { getUpsellModalStatType } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function StatsUpsellModal( { siteId }: { siteId: number } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const plan = useSelector( ( state ) => getPlanBySlug( state, PLAN_PREMIUM ) );
	const planMonthly = useSelector( ( state ) => getPlanBySlug( state, PLAN_PREMIUM_MONTHLY ) );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const planName = plan?.product_name_short ?? '';
	const isLoading = ! plan || ! planMonthly;
	const eventPrefix = isEnabled( 'is_running_in_jetpack_site' ) ? 'jetpack_odyssey' : 'calypso';
	const statType = useSelector( ( state ) => getUpsellModalStatType( state, siteId ) );

	const planPriceShow = plan?.product_display_price.replace(
		plan.raw_price.toString(),
		( plan.raw_price / 12 ).toString()
	);
	const closeModal = () => {
		dispatch( toggleUpsellModal( siteId, statType ) );
	};

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		closeModal();
		recordTracksEvent( `${ eventPrefix }_stats_upsell_modal_submit`, {
			stat_type: statType,
		} );

		page( `/checkout/${ siteSlug }/${ plan?.path_slug ?? 'premium' }` );
	};

	return (
		<Modal
			className="stats-upsell-modal"
			onRequestClose={ closeModal }
			__experimentalHideHeader={ true }
		>
			<TrackComponentView
				eventName={ `${ eventPrefix }_stats_upsell_modal_view` }
				eventProperties={ {
					stat_type: statType,
				} }
			/>
			<QueryPlans />
			<Button
				className="stats-upsell-modal__close-button"
				onClick={ closeModal }
				icon={ close }
				label={ translate( 'Close' ) }
			/>
			<div className="stats-upsell-modal__content">
				<div className="stats-upsell-modal__left">
					<h1 className="stats-upsell-modal__title">
						{ translate( 'Grow faster with Jetpack Stats' ) }
					</h1>
					<div className="stats-upsell-modal__text">
						{ translate( 'Finesse your scaling-up strategy with detailed insights and data.' ) }
					</div>
					<Button
						variant="primary"
						className="stats-upsell-modal__button"
						onClick={ onClick }
						disabled={ isLoading }
					>
						{ isLoading
							? translate( 'Upgrade plan' )
							: translate( 'Upgrade to %(planName)s', { args: { planName } } ) }
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
							dangerouslySetInnerHTML={ { __html: planPriceShow ?? '' } }
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
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell-modal__feature-text">
								{ translate(
									'All stats available: traffic trends, sources, optimal time to post…'
								) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell-modal__feature-text">
								{ translate( 'Download data as CSV' ) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell-modal__feature-text">
								{ translate( 'Instant access to upcoming features' ) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell-modal__feature-text">
								{ translate( '14-day money-back guarantee' ) }
							</div>
						</div>
						<div className="stats-upsell-modal__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell-modal__feature-text">
								{ translate( 'All %(planName)s plan features', {
									args: { planName },
								} ) }
							</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
}
