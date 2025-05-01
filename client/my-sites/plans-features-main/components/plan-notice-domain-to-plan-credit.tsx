import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import type { PlanSlug } from '@automattic/calypso-products';

type Props = {
	className?: string;
	onDismissClick?: () => void;
	siteId: number;
	visiblePlans?: PlanSlug[];
};

const PlanNoticeDomainToPlanCredit = ( {
	className,
	onDismissClick,
	siteId,
	visiblePlans,
}: Props ) => {
	const domainToPlanCreditsApplicable = useDomainToPlanCreditsApplicable( siteId, visiblePlans );
	const showNotice = domainToPlanCreditsApplicable !== null && domainToPlanCreditsApplicable > 0;
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const upgradeCreditDocsUrl = localizeUrl(
		'https://wordpress.com/support/manage-purchases/upgrade-your-plan/#upgrade-credit'
	);

	return (
		<>
			<QuerySitePlans siteId={ siteId } />
			{ showNotice && (
				<Notice
					className={ className }
					showDismiss={ !! onDismissClick }
					onDismissClick={ onDismissClick }
					icon="info-outline"
					status="is-success"
					theme="light"
				>
					{ translate(
						'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain. This credit will be applied to the pricing below at checkout if you purchase a plan today!',
						{
							args: {
								amountInCurrency: formatCurrency(
									domainToPlanCreditsApplicable,
									currencyCode ?? '',
									{ isSmallestUnit: true }
								),
							},
							components: {
								b: <strong />,
								a: <InlineSupportLink supportLink={ upgradeCreditDocsUrl } />,
							},
						}
					) }
				</Notice>
			) }
		</>
	);
};

export default PlanNoticeDomainToPlanCredit;
