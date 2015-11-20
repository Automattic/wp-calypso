/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:my-sites:upgrades:plans:site-specific-plan-details-mixin' );

module.exports = {
	componentWillMount: function() {
		this.getLatestSiteSpecificPlanDetails();
	},

	componentWillReceiveProps: function() {
		this.getLatestSiteSpecificPlanDetails();
	},

	getLatestSiteSpecificPlanDetails: function() {
		var site;
		if ( ! this.props.sites ) {
			return;
		}

		site = this.props.sites.getSelectedSite();
		this.props.siteSpecificPlansDetailsList.fetch( site.domain );
		debug( 'get latest plan details' );
	},
};
