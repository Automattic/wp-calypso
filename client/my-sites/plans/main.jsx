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
	siteSpecificPlansDetailsMixin = require( 'components/plans/site-specific-plan-details-mixin' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	config = require( 'config' ),
	EmptyContent = require( 'components/empty-content' ),
	UpgradesNavigation = require( 'my-sites/upgrades/navigation' );

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

		return <a href={ url } className="compare-plans-link" onClick={ this.recordComparePlansClick }>{ this.translate( 'Compare Plans' ) }</a>;
	},

	sidebarNavigation: function() {
		return <SidebarNavigation />;
	},

	renderUpgradePrompt() {
		return (
			<div className="main" role="main">
				<EmptyContent
					illustration="/calypso/images/drake/drake-whoops.svg"
					title={ this.translate( 'Want to add extra features to your site?', { context: 'site setting upgrade' } ) }
					line={ this.translate( 'Additional features are available with WordPress.com Business.', { context: 'site setting upgrade' } ) }
					/>
			</div>
		)
	},

	render: function() {
		var classNames = 'main main-column ',
			hasJpphpBundle = this.props.siteSpecificPlansDetailsList &&
				this.props.siteSpecificPlansDetailsList.hasJpphpBundle( this.props.sites.getSelectedSite().domain );

		if ( ! config.isEnabled( 'premium-plans' ) ) {
			return this.renderUpgradePrompt();
		}

		return (
			<div className={ classNames } role="main">
				{ this.sidebarNavigation() }
				<div id="plans" className="plans has-sidebar">
					{ this.sectionNavigation() }
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
	},

	sectionNavigation: function() {
		return (
			<UpgradesNavigation
				path={ this.props.context.path }
				cart={ this.props.cart }
				selectedSite={ this.props.sites.getSelectedSite() } />
		);
	}
} );
