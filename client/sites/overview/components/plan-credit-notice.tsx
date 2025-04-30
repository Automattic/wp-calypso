import { localizeUrl } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useDomainToPlanCreditsApplicable } from 'calypso/my-sites/plans-features-main/hooks/use-domain-to-plan-credits-applicable';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

const PlanCreditNotice = () => {
	const site = useSelector( getSelectedSite );
	const { ID: siteId } = site || {};
	const domainToPlanCreditsApplicable = useDomainToPlanCreditsApplicable( siteId );
	const showNotice = domainToPlanCreditsApplicable !== null && domainToPlanCreditsApplicable > 0;
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const upgradeCreditDocsUrl = localizeUrl(
		'https://wordpress.com/support/manage-purchases/upgrade-your-plan/#upgrade-credit'
	);

	if ( ! siteId ) {
		return null;
	}

	return (
		<>
			<QuerySitePlans siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			{ showNotice && (
				<Notice
					className="hosting-overview__domain-to-plan-credit-notice"
					isDismissible={ false }
					status="info"
					onRemove={ () => {} }
				>
					{ translate(
						'You have {{b}}%(amountInCurrency)s{{/b}} in {{a}}upgrade credits{{/a}} available from your current domain. This credit will be applied at checkout if you purchase a plan today!',
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

export default PlanCreditNotice;
