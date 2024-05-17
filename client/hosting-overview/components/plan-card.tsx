import { PlanSlug, PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { Button, PlanPrice, LoadingPlaceholder } from '@automattic/components';
import { AddOns } from '@automattic/data-stores';
import { usePricingMetaForGridPlans } from '@automattic/data-stores/src/plans';
import { formatCurrency } from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import PlanStorage from 'calypso/blocks/plan-storage';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { HostingCard } from 'calypso/components/hosting-card';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PlanStorageBar from 'calypso/hosting-overview/components/plan-storage-bar';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PricingSection: FC = () => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const planSlug = ( planDetails?.product_slug || '' ) as PlanSlug;
	const planData = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );
	const isFreePlan = planDetails?.is_free;
	const pricing = usePricingMetaForGridPlans( {
		coupon: undefined,
		planSlugs: [ planSlug ],
		siteId: site?.ID,
		storageAddOns: null,
		useCheckPlanAvailabilityForPurchase,
	} );
	const isLoading = ! pricing || ! planData;

	const getBillingDetails = () => {
		if ( isFreePlan ) {
			return null;
		}
		return translate( '{{span}}%(rawPrice)s{{/span}} billed annually, excludes taxes.', {
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
		} );
	};

	const getExpireDetails = () => {
		if ( isFreePlan ) {
			return translate( 'No expiration date.' );
		}
		return site?.plan?.expired
			? translate( 'Your plan has expired.' )
			: translate( 'Expires on %s.', {
					args: moment( planData?.expiryDate ).format( 'LL' ),
			  } );
	};

	return (
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
							comment: '/mo is short for per month, referring to the monthly price of a site plan',
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
				<div className="hosting-overview__plan-info">{ getBillingDetails() }</div>
			) }
			{ isLoading ? (
				<LoadingPlaceholder
					className="hosting-overview__plan-info-loading-placeholder"
					width="200px"
					height="16px"
				/>
			) : (
				<div
					className={ classNames( 'hosting-overview__plan-info', {
						'is-expired': site?.plan?.expired,
					} ) }
				>
					{ getExpireDetails() }
					<div className="hosting-overview__plan-cta">
						{ isFreePlan && (
							<Button primary compact href={ `/plans/${ site?.slug }` }>
								{ translate( 'Upgrade your plan' ) }
							</Button>
						) }
						{ site?.plan?.expired && (
							<>
								<Button compact href={ `/plans/${ site?.slug }` }>
									{ translate( 'See all plans' ) }
								</Button>
								<Button
									style={ { marginLeft: '8px' } }
									primary
									compact
									href={ `/checkout/${ site?.slug }/${ planData.productSlug }` }
								>
									{ translate( 'Renew plan' ) }
								</Button>
							</>
						) }
					</div>
				</div>
			) }
		</>
	);
};

const PlanCard: FC = () => {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const planName = planDetails?.product_name_short ?? '';
	const isFreePlan = planDetails?.is_free;

	// Check for storage addons available for purchase.
	const addOns = AddOns.useAddOns( { selectedSiteId: site?.ID } );
	const storageAddons = addOns.filter(
		( addOn ) => addOn?.productSlug === PRODUCT_1GB_SPACE && ! addOn?.exceedsSiteStorageLimits
	);

	return (
		<>
			<QuerySitePlans siteId={ site?.ID } />
			<HostingCard className="hosting-overview__plan">
				<div className="hosting-overview__plan-card-header">
					<h3 className="hosting-overview__plan-card-title">{ planName }</h3>

					<Button
						className={ classNames(
							'hosting-overview__link-button',
							'hosting-overview__mobile-hidden-link-button'
						) }
						plain
						href={
							isFreePlan ? `/add-ons/${ site?.slug }` : `/purchases/subscriptions/${ site?.slug }`
						}
					>
						{ isFreePlan ? translate( 'Manage add-ons' ) : translate( 'Manage plan' ) }
					</Button>
				</div>
				<PricingSection />
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
								{ translate( 'Need more space?' ) }
							</Button>
						</div>
					) }
				</PlanStorage>
			</HostingCard>
		</>
	);
};

export default PlanCard;
