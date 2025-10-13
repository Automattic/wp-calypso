import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import { usePlanUpgradeCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-plan-upgrade-credits-applicable';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { PlanSlug } from '@automattic/calypso-products';
import type { PlansIntent } from '@automattic/plans-grid-next';

type Props = {
	className?: string;
	onDismissClick?: () => void;
	siteId: number;
	visiblePlans?: PlanSlug[];
	intent?: PlansIntent;
};

const PlanNoticePlanToHigherPlanCredit = ( {
	className,
	onDismissClick,
	siteId,
	visiblePlans,
	intent,
}: Props ) => {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const planUpgradeCreditsApplicable = usePlanUpgradeCreditsApplicable( siteId, visiblePlans );

	const showNotice =
		visiblePlans &&
		visiblePlans.length > 0 &&
		planUpgradeCreditsApplicable !== null &&
		planUpgradeCreditsApplicable > 0;

	// Check if this is the plans-upgrade flow which requires compact styling
	const isUpgradeFlow = intent === 'plans-upgrade';

	return (
		<>
			<QuerySitePlans siteId={ siteId } />
			{ showNotice && isUpgradeFlow && (
				<div className="plan-upgrade-credit-notice-compact">
					{ translate( 'You have %(amountInCurrency)s in upgrade credits available', {
						args: {
							amountInCurrency: formatCurrency( planUpgradeCreditsApplicable, currencyCode ?? '', {
								isSmallestUnit: true,
								stripZeros: true,
							} ),
						},
					} ) }
				</div>
			) }
			{ showNotice && ! isUpgradeFlow && (
				<Notice
					className={ className }
					showDismiss={ !! onDismissClick }
					onDismissClick={ onDismissClick }
					icon="info-outline"
					status="is-success"
					theme="light"
				>
					{ translate(
						'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current plan. This credit will be applied to the pricing below at checkout if you upgrade today!',
						{
							args: {
								amountInCurrency: formatCurrency(
									planUpgradeCreditsApplicable,
									currencyCode ?? '',
									{
										isSmallestUnit: true,
									}
								),
							},
							components: {
								b: <strong />,
								a: <InlineSupportLink supportContext="plans-upgrade-credit" showIcon={ false } />,
							},
						}
					) }
				</Notice>
			) }
		</>
	);
};

export default PlanNoticePlanToHigherPlanCredit;
