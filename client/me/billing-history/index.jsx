/**
 * External dependencies
 */
var React = require( 'react' ),
	classes = require( 'component-classes' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	FormSectionHeading = require( 'components/forms/form-section-heading' ),
	Card = require( 'components/card' ),
	MeSidebarNavigation = require( 'me/sidebar-navigation' ),
	config = require( 'config' ),
	CreditCards = require( 'me/credit-cards' ),
	storedCards = require( 'lib/stored-cards' )(),
	eventRecorder = require( 'me/event-recorder' ),
	PurchasesHeader = require( '../purchases/list/header' ),
	BillingHistoryTable = require( './billing-history-table' ),
	UpcomingChargesTable = require( './upcoming-charges-table' ),
	SectionHeader = require( 'components/section-header' );

module.exports = React.createClass( {
	displayName: 'BillingHistory',

	mixins: [ observe( 'billingData' ), eventRecorder ],

	componentWillMount: function() {
		classes( document.body ).add( 'billing-history-page' );
	},

	componentWillUnmount: function() {
		classes( document.body ).remove( 'billing-history-page' );
	},

	renderManageCards: function() {
		if ( config.isEnabled( 'me/credit-cards' ) ) {
			return (
				<CreditCards cards={ storedCards } />
			);
		}
	},

	render: function() {
		var data = this.props.billingData.get();

		return (

			<div id="billing-history-wrapper" className="main">
				<MeSidebarNavigation />
				<PurchasesHeader section={ 'billing' } />
				<SectionHeader label={ this.translate( 'Receipts' ) } />
				<Card id="billing-history-content">
					<div className="billing-history-header">
						<p>
							{
								this.translate(
									'A complete history of all billing transactions for your WordPress.com account. If you are looking to add or cancel a plan go to {{link}}My Upgrades{{/link}}.',
									{
										components: {
											link: <a href="//wordpress.com/my-upgrades/" rel="external" onClick={ this.recordClickEvent( 'My Upgrades Link on Billing History' ) }/>
										}
									}
								)
							}
						</p>
					</div>

					<BillingHistoryTable transactions={ data.billingHistory } />
				</Card>

				<SectionHeader label={ this.translate( 'Upcoming Charges' ) } />
				<Card id="upcoming-charges">
					<UpcomingChargesTable transactions={ data.upcomingCharges } />
				</Card>

				{ this.renderManageCards() }

			</div>
		);
	}
} );
