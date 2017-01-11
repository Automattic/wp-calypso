/**
 * External dependencies
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import Card from 'components/card';
import MeSidebarNavigation from 'me/sidebar-navigation';
import config from 'config';
import CreditCards from 'me/purchases/credit-cards';
import eventRecorder from 'me/event-recorder';
import PurchasesHeader from '../purchases/list/header';
import BillingHistoryTable from './billing-history-table';
import UpcomingChargesTable from './upcoming-charges-table';
import SectionHeader from 'components/section-header';
import Main from 'components/main';
import purchasesPaths from 'me/purchases/paths';

const BillingHistory = React.createClass( {
	mixins: [ observe( 'billingData', 'sites' ), eventRecorder ],

	render() {
		const { billingData, sites, translate } = this.props;
		const data = billingData.get();
		const hasBillingHistory = ! isEmpty( data.billingHistory );

		return (
			<Main className="billing-history">
				<MeSidebarNavigation />
				<PurchasesHeader section={ 'billing' } />
				<Card className="billing-history__receipts">
					<BillingHistoryTable transactions={ data.billingHistory } />
				</Card>
				<Card href={ purchasesPaths.purchasesRoot() }>
					{ translate( 'Go to "Purchases" to add or cancel a plan.' ) }
				</Card>
				{ hasBillingHistory &&
					<div>
						<SectionHeader label={ translate( 'Upcoming Charges' ) } />
						<Card className="billing-history__upcoming-charges">
							<UpcomingChargesTable sites={ sites } transactions={ data.upcomingCharges } />
						</Card>
					</div>
				}
				{ config.isEnabled( 'upgrades/credit-cards' ) &&
					<CreditCards />
				}
			</Main>
		);
	}
} );

export default localize( BillingHistory );
