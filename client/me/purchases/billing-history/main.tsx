import config from '@automattic/calypso-config';
import { CompactCard, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import { useGeoLocationQuery } from 'calypso/data/geo/use-geolocation-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import BillingHistoryList from 'calypso/me/purchases/billing-history/billing-history-list';
import { vatDetails as vatDetailsPath, billingHistoryReceipt } from 'calypso/me/purchases/paths';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import titles from 'calypso/me/purchases/titles';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import { getVatVendorInfo } from './vat-vendor-details';

import './style.scss';

export function BillingHistoryContent( {
	siteId = null,
	getReceiptUrlFor = billingHistoryReceipt,
}: {
	siteId: number | null;
	getReceiptUrlFor: ( receiptId: string | number ) => string;
} ) {
	return (
		<Card className="billing-history__receipts">
			<BillingHistoryList header siteId={ siteId } getReceiptUrlFor={ getReceiptUrlFor } />
		</Card>
	);
}

function BillingHistory() {
	const translate = useTranslate();
	const { vatDetails } = useVatDetails();
	const { data: geoData } = useGeoLocationQuery();
	const vendorInfo = getVatVendorInfo(
		vatDetails.country ?? geoData?.country_short ?? 'GB',
		'now',
		translate
	);

	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const editVatText = translate( 'Edit %s details', {
		textOnly: true,
		args: [ vendorInfo?.taxName ?? translate( 'VAT', { textOnly: true } ) ],
	} );
	/* translators: %s is the name of taxes in the country (eg: "VAT" or "GST"). */
	const addVatText = translate( 'Add %s details', {
		textOnly: true,
		args: [ vendorInfo?.taxName ?? translate( 'VAT', { textOnly: true } ) ],
	} );
	const vatText = vatDetails.id ? editVatText : addVatText;

	return (
		<Main wideLayout className="billing-history">
			<DocumentHead title={ titles.billingHistory } />
			<PageViewTracker path="/me/purchases/billing" title="Me > Billing History" />
			<FormattedHeader
				brandFont
				headerText={ titles.sectionTitle }
				subHeaderText={ translate(
					'View, print, and email your receipts. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="billing" showIcon={ false } />,
						},
					}
				) }
				align="left"
			/>
			<QueryBillingTransactions transactionType="past" />
			<PurchasesNavigation section="billingHistory" />
			<BillingHistoryContent siteId={ null } getReceiptUrlFor={ billingHistoryReceipt } />

			{ config.isEnabled( 'me/vat-details' ) && (
				<CompactCard href={ vatDetailsPath }>{ vatText }</CompactCard>
			) }
		</Main>
	);
}
export default BillingHistory;
