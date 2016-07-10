/**
 * External dependencies
 */
var React = require( 'react' ),
	isEmpty = require( 'lodash/isEmpty' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	Card = require( 'components/card' ),
	MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	config = require( 'config' ),
	CreditCards = require( 'me/credit-cards' ),
	eventRecorder = require( 'me/event-recorder' ),
	PurchasesHeader = require( '../purchases/list/header' ),
	BillingHistoryTable = require( './billing-history-table' ),
	UpcomingChargesTable = require( './upcoming-charges-table' ),
	SectionHeader = require( 'components/section-header' );

import Main from 'components/main';
import puchasesPaths from 'me/purchases/paths';

module.exports = React.createClass( {
	displayName: 'BillingHistory',

	mixins: [ observe( 'billingData', 'sites' ), eventRecorder ],

	render: function() {
		var data = this.props.billingData.get();
		const hasBillingHistory = ! isEmpty( data.billingHistory );

		return (
			<Main className="billing-history">
				<MeSidebarNavigation />
				<PurchasesHeader section={ 'billing' } />
				<Card className="billing-history__receipts">
					<BillingHistoryTable transactions={ data.billingHistory } />
				</Card>
				<Card href={ puchasesPaths.list() }>
					{ this.translate( 'Go to "Purchases" to add or cancel a plan.' ) }
				</Card>
				{ hasBillingHistory &&
					<div>
						<SectionHeader label={ this.translate( 'Upcoming Charges' ) } />
						<Card className="billing-history__upcoming-charges">
							<UpcomingChargesTable sites={ this.props.sites } transactions={ data.upcomingCharges } />
						</Card>
					</div> }
				{ config.isEnabled( 'upgrades/credit-cards' ) &&
					<CreditCards /> }
			</Main>
		);
	}
} );
