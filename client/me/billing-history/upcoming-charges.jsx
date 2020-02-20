/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import UpcomingChargesTable from './upcoming-charges-table';
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'components/data/query-billing-transactions';

/**
 * Style dependencies
 */
import './style.scss';

const UpcomingCharges = ( { translate } ) => (
	<Main>
		<DocumentHead title={ translate( 'Upcoming Charges' ) } />
		<PageViewTracker path="/me/purchases/upcoming" title="Me > Upcoming Charges" />
		<MeSidebarNavigation />
		<QueryBillingTransactions />
		<PurchasesHeader section={ 'upcoming' } />
		<Card className="billing-history__upcoming-charges">
			<UpcomingChargesTable />
		</Card>
	</Main>
);

export default localize( UpcomingCharges );
