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
	storedCards = require( 'lib/stored-cards' )(),
	eventRecorder = require( 'me/event-recorder' ),
	PurchasesHeader = require( '../purchases/list/header' ),
	BillingHistoryTable = require( './billing-history-table' ),
	UpcomingChargesTable = require( './upcoming-charges-table' ),
	SectionHeader = require( 'components/section-header' ),
	puchasesPaths = require( 'me/purchases/paths' );

import Main from 'components/main';

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
				<SectionHeader label={ this.translate( 'Receipts' ) } />
				<Card id="billing-history__content">
					<div className="billing-history__header">
						<p>
							{
								this.translate(
									'A complete history of all billing transactions for your WordPress.com account. If you are looking to add or cancel a plan go to {{link}}Manage Purchases{{/link}}.', {
										components: {
											link: <a href={ puchasesPaths.list() }
												onClick={ this.recordClickEvent( 'Manage Purchases Link on Billing History' ) } />
										}
									}
								)
							}
						</p>
					</div>
					<BillingHistoryTable transactions={ data.billingHistory } />
				</Card>
				{ hasBillingHistory &&
					<div>
						<SectionHeader label={ this.translate( 'Upcoming Charges' ) } />
						<Card className="billing-history__upcoming-charges">
							<UpcomingChargesTable sites={ this.props.sites } transactions={ data.upcomingCharges } />
						</Card>
					</div> }
				{ config.isEnabled( 'upgrades/credit-cards' ) &&
					<CreditCards cards={ storedCards } /> }
			</Main>
		);
	}
} );
