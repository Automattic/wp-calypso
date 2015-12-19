/**
 * External dependencies
 */
var React = require( 'react' ),
	connect = require( 'react-redux' ).connect;

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	config = require( 'config' ),
	observe = require( 'lib/mixins/data-observe' ),
	PlanList = require( 'components/plans/plan-list' ),
	PlanOverview = require( './plan-overview' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	UpgradesNavigation = require( 'my-sites/upgrades/navigation' ),
	Gridicon = require( 'components/gridicon' ),
	fetchSitePlans = require( 'state/sites/plans/actions' ).fetchSitePlans,
	getPlansBySiteId = require( 'state/sites/plans/selectors' ).getPlansBySiteId,
	getCurrentPlan = require( 'lib/plans' ).getCurrentPlan,
	isJpphpBundle = require( 'lib/products-values' ).isJpphpBundle;

var Plans = React.createClass( {
	displayName: 'Plans',

	mixins: [ observe( 'sites', 'plans' ) ],

	getInitialState: function() {
		return { openPlan: '' };
	},

	componentDidMount: function() {
		this.props.fetchSitePlans( this.props.selectedSite.ID );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.selectedSite.ID !== nextProps.selectedSite.ID ) {
			this.props.fetchSitePlans( nextProps.selectedSite.ID );
		}
	},

	openPlan: function( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	recordComparePlansClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked Compare Plans Link' );
	},

	comparePlansLink: function() {
		var url = '/plans/compare',
			selectedSite = this.props.selectedSite;

		if ( this.props.plans.get().length <= 0 ) {
			return '';
		}

		if ( selectedSite ) {
			url += '/' + selectedSite.slug;
		}

		return (
			<a href={ url } className="compare-plans-link" onClick={ this.recordComparePlansClick }>
				<Gridicon icon="clipboard" size={ 18 } />
				{ this.translate( 'Compare Plans' ) }
			</a>
		);
	},

	renderTrialCopy: function() {
		if ( ! this.props.sitePlans.hasLoadedFromServer || ! config.isEnabled( 'upgrades/free-trials' ) ) {
			return null;
		}
		return <div className="plans__trial-copy">{ this.translate( 'Try WordPress.com Premium or Business free for 14 days, no credit card required' ) }</div>;
	},

	render: function() {
		var classNames = 'main main-column ',
			hasJpphpBundle,
			currentPlan;

		if ( this.props.sitePlans.hasLoadedFromServer ) {
			currentPlan = getCurrentPlan( this.props.sitePlans.data );
			hasJpphpBundle = isJpphpBundle( currentPlan );
		}

		if ( config.isEnabled( 'upgrades/free-trials' ) &&
			this.props.sitePlans.hasLoadedFromServer &&
			currentPlan.freeTrial ) {
			return (
				<PlanOverview
					path={ this.props.context.path }
					cart={ this.props.cart }
					plan={ currentPlan }
					selectedSite={ this.props.selectedSite } />
			);
		}

		return (
			<div className={ classNames } role="main">
				<SidebarNavigation />

				<div id="plans" className="plans has-sidebar">
					<UpgradesNavigation
						path={ this.props.context.path }
						cart={ this.props.cart }
						selectedSite={ this.props.selectedSite } />

					{ this.renderTrialCopy() }

					<PlanList
						sites={ this.props.sites }
						plans={ this.props.plans.get() }
						enableFreeTrials={ true }
						sitePlans={ this.props.sitePlans }
						onOpen={ this.openPlan }
						onSelectPlan={ this.props.onSelectPlan }
						cart={ this.props.cart } />
					{ ! hasJpphpBundle && this.comparePlansLink() }
				</div>
			</div>
		);
	}
} );

module.exports = connect(
	function mapStateToProps( state, props ) {
		return {
			sitePlans: getPlansBySiteId( state, props.selectedSite.ID )
		};
	},
	function mapDispatchToProps( dispatch ) {
		return {
			fetchSitePlans( siteId ) {
				dispatch( fetchSitePlans( siteId ) );
			}
		};
	}
)( Plans );
