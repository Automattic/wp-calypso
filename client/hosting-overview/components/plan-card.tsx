import { PlanSlug } from '@automattic/calypso-products';
import { ProgressBar, Button, Card, PlanPrice } from '@automattic/components';
import { usePricingMetaForGridPlans } from '@automattic/data-stores/src/plans';
import { formatCurrency } from '@automattic/format-currency';
import { Icon, cloud } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PlanCard: FC = () => {
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
	const translate = useTranslate();

	// TODO: Replace with real data using <PlanStorage /> component
	const usedGigabytes = 47;
	const availableUnitAmount = 50;

	return (
		<>
			<QuerySitePlans siteId={ site?.ID } />
			<Card className={ classNames( 'hosting-overview__card', 'hosting-overview__plan' ) }>
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
						<PlanPrice
							className="hosting-overview__plan-price"
							currencyCode={ planData?.currencyCode }
							displayPerMonthNotation
							isSmallestUnit
							rawPrice={ pricing?.[ planSlug ].originalPrice.monthly }
						/>
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
						<div className="hosting-overview__plan-info">
							{ translate( 'Expires on %s.', {
								args: moment( planData?.expiryDate ).format( 'LL' ),
							} ) }
						</div>
					</>
				) }
				<div className="hosting-overview__plan-storage">
					<div className="hosting-overview__plan-storage-title-wrapper">
						<div className="hosting-overview__plan-storage-title">
							<Icon icon={ cloud } />
							{ translate( 'Storage' ) }
						</div>
						<span>
							{ translate(
								'Using {{usedStorage}}%(usedGigabytes).1f GB{{/usedStorage}} of %(availableUnitAmount)d GB',
								'Using {{usedStorage}}%(usedGigabytes).1f GB{{/usedStorage}} of %(availableUnitAmount)d GB',
								{
									count: usedGigabytes,
									args: { usedGigabytes, availableUnitAmount },
									comment:
										'Must use unit abbreviation; describes used vs available storage amounts (e.g., Using 20.0GB of 30GB, Using 0.5GB of 20GB)',
									components: { usedStorage: <span className="used-space__span" /> },
								}
							) }
						</span>
					</div>
					<ProgressBar
						color="var(--studio-red-30)"
						value={ usedGigabytes / availableUnitAmount }
						total={ 1 }
					/>
					<div className="hosting-overview__plan-storage-footer">
						<Button
							className="hosting-overview__link-button"
							plain
							href={ `/plans/${ site?.slug }` }
						>
							{ translate( 'Need more storage?' ) }
						</Button>
					</div>
				</div>
			</Card>
		</>
	);
};

export default PlanCard;
