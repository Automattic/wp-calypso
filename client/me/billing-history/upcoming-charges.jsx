/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PurchasesHeader from '../purchases/purchases-list/header';
import UpcomingChargesTable from './upcoming-charges-table';
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryBillingTransactions from 'calypso/components/data/query-billing-transactions';
import titles from 'calypso/me/purchases/titles';
import FormattedHeader from 'calypso/components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

const UpcomingCharges = ( { translate } ) => (
	<Main className="upcoming-charges is-wide-layout">
		<DocumentHead title={ translate( 'Upcoming Charges' ) } />
		<PageViewTracker path="/me/purchases/upcoming" title="Me > Upcoming Charges" />
		<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />

		<MeSidebarNavigation />
		<QueryBillingTransactions />
		<PurchasesHeader section={ 'upcoming' } />
		<Card className="billing-history__upcoming-charges">
			<UpcomingChargesTable />
		</Card>
	</Main>
);

export default localize( UpcomingCharges );
