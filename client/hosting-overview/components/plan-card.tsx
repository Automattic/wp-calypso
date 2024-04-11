import { PLAN_PREMIUM, PlanSlug } from '@automattic/calypso-products';
import { Button, Card, PlanPrice } from '@automattic/components';
import { usePricingMetaForGridPlans } from '@automattic/data-stores/src/plans';
import { formatCurrency } from '@automattic/format-currency';
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
	const sitePlan = site?.plan;
	const planName = sitePlan?.product_name_short ?? '';
	const planSlug = ( sitePlan?.product_slug || '' ) as PlanSlug;
	const plan = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );
	const pricing = usePricingMetaForGridPlans( {
		coupon: undefined,
		planSlugs: [ planSlug ],
		selectedSiteId: site?.ID,
		storageAddOns: null,
		useCheckPlanAvailabilityForPurchase,
	} );
	const translate = useTranslate();

	console.debug( 'site', site );
	console.debug( 'plan', plan );
	console.debug( 'pricingMeta', pricing );

	return (
		<>
			<QuerySitePlans siteId={ site?.ID } />
			<Card className="hosting-overview__card">
				<div>
					<div className="hosting-overview__plan-card-header">
						<h3 className="hosting-overview__plan-card-title">{ planName }</h3>

						<Button
							className="hosting-overview__link-button"
							plain
							href={ `/plans/${ site?.slug }` }
						>
							{ translate( 'Manage plan' ) }
						</Button>
					</div>
					<PlanPrice
						className="hosting-overview__plan-price"
						currencyCode={ plan?.currencyCode }
						displayPerMonthNotation
						isSmallestUnit
						rawPrice={ pricing?.[ planSlug ].originalPrice.monthly }
					/>
					<div className="hosting-overview__plan-info">
						{ translate( '{{span}}%(rawPrice)s{{/span}} billed annually.', {
							args: {
								rawPrice: formatCurrency(
									pricing?.[ planSlug ].originalPrice.full ?? 0,
									plan?.currencyCode ?? '',
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
						{ translate( 'Expires on %s.', { args: moment( plan?.expiryDate ).format( 'LL' ) } ) }
					</div>
				</div>
			</Card>
		</>
	);
};

export default PlanCard;
