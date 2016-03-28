/**
 * External dependencies
 */
var connect = require( 'react-redux' ).connect,
	page = require( 'page' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	fetchSitePlans = require( 'state/sites/plans/actions' ).fetchSitePlans,
	getCurrentPlan = require( 'lib/plans' ).getCurrentPlan,
	shouldFetchSitePlans = require( 'lib/plans' ).shouldFetchSitePlans,
	getPlansBySite = require( 'state/sites/plans/selectors' ).getPlansBySite,
	Gridicon = require( 'components/gridicon' ),
	isJpphpBundle = require( 'lib/products-values' ).isJpphpBundle,
	Main = require( 'components/main' ),
	Notice = require( 'components/notice' ),
	observe = require( 'lib/mixins/data-observe' ),
	paths = require( './paths' ),
	PlanList = require( 'components/plans/plan-list' ),
	PlanOverview = require( './plan-overview' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	UpgradesNavigation = require( 'my-sites/upgrades/navigation' ),
	transactionStepTypes = require( 'lib/store-transactions/step-types' );

var Plans = React.createClass( {
	displayName: 'Plans',

	mixins: [ observe( 'sites', 'plans' ) ],

	getInitialState: function() {
		return { openPlan: '' };
	},

	componentDidMount: function() {
		this.updateSitePlans( this.props.sitePlans );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.updateSitePlans( nextProps.sitePlans );
	},

	updateSitePlans: function( sitePlans ) {
		var selectedSite = this.props.sites.getSelectedSite();
		this.props.fetchSitePlans( sitePlans, selectedSite );
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

		var compareString = this.translate( 'Compare Plans' );

		if ( selectedSite.jetpack ) {
			compareString = this.translate( 'Compare Options' );
		}

		if ( this.props.plans.get().length <= 0 ) {
			return '';
		}

		if ( selectedSite ) {
			url += '/' + selectedSite.slug;
		}

		return (
			<a href={ url } className="compare-plans-link" onClick={ this.recordComparePlansClick }>
				<Gridicon icon="clipboard" size={ 18 } />
				{ compareString }
			</a>
		);
	},

	redirectToDefault() {
		page.redirect( paths.plans( this.props.sites.getSelectedSite().slug ) );
	},

	renderNotice() {
		if ( 'free-trial-canceled' === this.props.destinationType ) {
			return (
				<Notice onDismissClick={ this.redirectToDefault } status="is-success">
					{ this.translate( 'Your trial has been removed. Thanks for giving it a try!' ) }
				</Notice>
			);
		}
	},

	render: function() {
		var selectedSite = this.props.sites.getSelectedSite(),
			hasJpphpBundle,
			currentPlan;

		if ( this.props.sitePlans.hasLoadedFromServer ) {
			currentPlan = getCurrentPlan( this.props.sitePlans.data );
			hasJpphpBundle = isJpphpBundle( currentPlan );
		}

		if ( this.props.sitePlans.hasLoadedFromServer && currentPlan.freeTrial ) {
			return (
				<PlanOverview
					sitePlans={ this.props.sitePlans }
					path={ this.props.context.path }
					cart={ this.props.cart }
					destinationType={ this.props.context.params.destinationType }
					plan={ currentPlan }
					selectedSite={ selectedSite } />
			);
		}

		return (
			<div>
				{ this.renderNotice() }

				<Main>
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							sitePlans={ this.props.sitePlans }
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ selectedSite } />

						<PlanList
							site={ selectedSite }
							plans={ this.props.plans.get() }
							sitePlans={ this.props.sitePlans }
							onOpen={ this.openPlan }
							onSelectPlan={ this.props.onSelectPlan }
							cart={ this.props.cart }
							isSubmitting={ this.props.transaction.step.name === transactionStepTypes.SUBMITTING_WPCOM_REQUEST } />
						{ ! hasJpphpBundle && this.comparePlansLink() }
					</div>
				</Main>
			</div>
		);
	}
} );

module.exports = connect(
	function mapStateToProps( state, props ) {
		return {
			sitePlans: getPlansBySite( state, props.sites.getSelectedSite() )
		};
	},
	function mapDispatchToProps( dispatch ) {
		return {
			fetchSitePlans( sitePlans, site ) {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			}
		};
	}
)( Plans );
