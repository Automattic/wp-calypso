import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import BillingHistoryListDataView from 'calypso/me/purchases/billing-history/billing-history-list-data-view';
import { billingHistoryReceipt } from 'calypso/me/purchases/paths';
import PurchasesNavigation from 'calypso/me/purchases/purchases-navigation';
import titles from 'calypso/me/purchases/titles';

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
			/>
			<QueryBillingTransactions transactionType="past" />
			<PurchasesNavigation section="billingHistory" />
			<BillingHistoryContent siteId={ null } getReceiptUrlFor={ billingHistoryReceipt } />
		</Main>
	);
}
export default BillingHistory;
