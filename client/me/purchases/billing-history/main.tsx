import { Card } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import BillingHistoryListDataView from 'calypso/me/purchases/billing-history/billing-history-list-data-view';
import { vatDetails as vatDetailsPath, billingHistoryReceipt } from 'calypso/me/purchases/paths';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import titles from 'calypso/me/purchases/titles';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';

import './style.scss';

export function BillingHistoryContent( {
	siteId = null,
	getReceiptUrlFor = billingHistoryReceipt,
}: {
	siteId: number | null;
	getReceiptUrlFor: ( receiptId: string | number ) => string;
} ) {
	return (
		<Card id="billing-history" className="section-content" tagName="section">
			<BillingHistoryListDataView siteId={ siteId } getReceiptUrlFor={ getReceiptUrlFor } />
		</Card>
	);
}

function BillingHistory() {
	const translate = useTranslate();
	const { vatDetails } = useVatDetails();
	const { data: geoData } = useGeoLocationQuery();
	const taxName = useTaxName( vatDetails.country ?? geoData?.country_short ?? 'GB' );

	const genericTaxName =
		/* translators: This is a generic name for taxes to use when we do not know the user's country. */
		translate( 'tax (VAT/GST/CT)' );
	const fallbackTaxName = genericTaxName;
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const editVatText = translate( 'Edit %s details', {
		textOnly: true,
		args: [ taxName ?? fallbackTaxName ],
	} );
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const addVatText = translate( 'Add %s details', {
		textOnly: true,
		args: [ taxName ?? fallbackTaxName ],
	} );
	const vatText = vatDetails.id ? editVatText : addVatText;

	return (
		<Main id="purchases" wideLayout>
			<DocumentHead title={ titles.billingHistory } />
			<PageViewTracker path="/me/purchases/billing" title="Me > Billing History" />
			<NavigationHeader
				navigationItems={ [] }
				title={ titles.sectionTitle }
				subtitle={ translate(
					'View, print, and email your receipts. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="billing" showIcon={ false } />,
						},
					}
				) }
			>
				<Button
					className="billing-history__tax-details-notice"
					variant="secondary"
					href={ vatDetailsPath }
				>
					{ vatText }
				</Button>
			</NavigationHeader>
			<QueryBillingTransactions transactionType="past" />
			<PurchasesNavigation section="billingHistory" />
			<BillingHistoryContent siteId={ null } getReceiptUrlFor={ billingHistoryReceipt } />
		</Main>
	);
}
export default BillingHistory;
