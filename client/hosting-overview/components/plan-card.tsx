import { PlanSlug } from '@automattic/calypso-products';
import { Button, Card, PlanPrice, LoadingPlaceholder } from '@automattic/components';
import { AddOns } from '@automattic/data-stores';
import { usePricingMetaForGridPlans } from '@automattic/data-stores/src/plans';
import { formatCurrency } from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import PlanStorage from 'calypso/blocks/plan-storage';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PlanStorageBar from 'calypso/hosting-overview/components/plan-storage-bar';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PlanCard: FC = () => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const planName = planDetails?.product_name_short ?? '';
	const planSlug = ( planDetails?.product_slug || '' ) as PlanSlug;
	const isPaidPlan = ! planDetails?.is_free;
	const planData = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );
	const pricing = usePricingMetaForGridPlans( {
		coupon: undefined,
		planSlugs: [ planSlug ],
		siteId: site?.ID,
		storageAddOns: null,
		useCheckPlanAvailabilityForPurchase,
	} );

	// Check for storage addons available for purchase
	const addOns = AddOns.useAddOns( { selectedSiteId: site?.ID } );
	const storageAddons = addOns.filter(
		( addOn ) =>
			addOn?.productSlug === 'wordpress_com_1gb_space_addon_yearly' &&
			! addOn?.exceedsSiteStorageLimits
	);

	const isLoading = ! pricing || ! planData;

	return (
		<>
			<QuerySitePlans siteId={ site?.ID } />
			<Card
				className={ classNames( 'hosting-overview__card', 'hosting-overview__plan', {
					'hosting-overview__plan--is-free': ! isPaidPlan,
				} ) }
			>
				<div className="hosting-overview__plan-card-header">
					<h3 className="hosting-overview__plan-card-title">{ planName }</h3>

					<Button
						className={ classNames(
							'hosting-overview__link-button',
							'hosting-overview__mobile-hidden-link-button'
						) }
						plain
						href={ `/plans/${ site?.slug }` }
					>
						{ translate( 'Manage plan' ) }
					</Button>
				</div>
				{ isPaidPlan && (
					<>
						{ isLoading ? (
							<LoadingPlaceholder
								className="hosting-overview__plan-price-loading-placeholder"
								width="100px"
								height="32px"
							/>
						) : (
							<div className="hosting-overview__plan-price-wrapper">
								<PlanPrice
									className="hosting-overview__plan-price"
									currencyCode={ planData?.currencyCode }
									isSmallestUnit
									rawPrice={ pricing?.[ planSlug ].originalPrice.monthly }
								/>
								<span className="hosting-overview__plan-price-term">
									{ translate( '/mo', {
										comment:
											'/mo is short for per month, referring to the monthly price of a site plan',
									} ) }
								</span>
							</div>
						) }
						{ isLoading ? (
							<LoadingPlaceholder
								className="hosting-overview__plan-info-loading-placeholder"
								width="200px"
								height="16px"
							/>
						) : (
							<div className="hosting-overview__plan-info">
								{ translate( '{{span}}%(rawPrice)s{{/span}} billed annually, excludes taxes.', {
									args: {
										rawPrice: formatCurrency(
											pricing?.[ planSlug ].originalPrice.full ?? 0,
											planData?.currencyCode ?? '',
											{
												stripZeros: true,
												isSmallestUnit: true,
											}
										),
									},
									components: {
										span: <span />,
									},
								} ) }
							</div>
						) }
						{ isLoading ? (
							<LoadingPlaceholder
								className="hosting-overview__plan-info-loading-placeholder"
								width="200px"
								height="16px"
							/>
						) : (
							<div className="hosting-overview__plan-info">
								{ translate( 'Expires on %s.', {
									args: moment( planData?.expiryDate ).format( 'LL' ),
								} ) }
							</div>
						) }
					</>
				) }
				<PlanStorage
					className="hosting-overview__plan-storage"
					hideWhenNoStorage
					siteId={ site?.ID }
					StorageBarComponent={ PlanStorageBar }
				>
					{ storageAddons.length > 0 && (
						<div className="hosting-overview__plan-storage-footer">
							<Button
								className="hosting-overview__link-button"
								plain
								href={ `/add-ons/${ site?.slug }` }
							>
								{ translate( 'Need more storage?' ) }
							</Button>
						</div>
					) }
				</PlanStorage>
			</Card>
		</>
	);
};

export default PlanCard;
