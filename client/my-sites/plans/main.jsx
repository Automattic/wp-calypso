/**
 * External dependencies
 */
var React = require( 'react/addons' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	observe = require( 'lib/mixins/data-observe' ),
	PlanList = require( 'components/plans/plan-list' ),
	PlanOverview = require( './plan-overview' ),
	siteSpecificPlansDetailsMixin = require( 'components/plans/site-specific-plan-details-mixin' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	UpgradesNavigation = require( 'my-sites/upgrades/navigation' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'Plans',

	mixins: [ siteSpecificPlansDetailsMixin, observe( 'sites', 'plans', 'siteSpecificPlansDetailsList' ) ],

	getInitialState: function() {
		return { openPlan: '' };
	},

	openPlan: function( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	recordComparePlansClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Compare Plans Link' );
	},

	comparePlansLink: function() {
		var url = '/plans/compare',
			selectedSite = this.props.sites.getSelectedSite();

		if ( this.props.plans.get().length <= 0 ) {
			return '';
		}

		if ( selectedSite ) {
			url += '/' + selectedSite.slug;
		}

		return (
			<a href={ url } className="compare-plans-link" onClick={ this.recordComparePlansClick }>
				<Gridicon icon="clipboard" size="18" />
				{ this.translate( 'Compare Plans' ) }
			</a>
		);
	},

	render: function() {
		var classNames = 'main main-column ',
			hasJpphpBundle = this.props.siteSpecificPlansDetailsList &&
				this.props.siteSpecificPlansDetailsList.hasJpphpBundle( this.props.sites.getSelectedSite().domain );

		var currentPlan = this.props.siteSpecificPlansDetailsList.getCurrentPlan( this.props.sites.getSelectedSite().domain );

		if ( currentPlan.free_trial ) {
			return (
				<PlanOverview
					path={ this.props.context.path }
					cart={ this.props.cart }
					selectedSite={ this.props.sites.getSelectedSite() } />
			);
		}

		return (
			<div className={ classNames } role="main">
				<SidebarNavigation />

				<div id="plans" className="plans has-sidebar">
					<UpgradesNavigation
						path={ this.props.context.path }
						cart={ this.props.cart }
						selectedSite={ this.props.sites.getSelectedSite() } />

					<PlanList
						sites={ this.props.sites }
						plans={ this.props.plans.get() }
						siteSpecificPlansDetailsList={ this.props.siteSpecificPlansDetailsList }
						onOpen={ this.openPlan }
						onSelectPlan={ this.props.onSelectPlan }
						cart={ this.props.cart } />
					{ ! hasJpphpBundle && this.comparePlansLink() }
				</div>
			</div>
		);
	}
} );
