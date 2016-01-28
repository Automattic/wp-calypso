/**
 * External dependencies
 */
var connect = require( 'react-redux' ).connect,
	find = require( 'lodash/collection/find' ),
	page = require( 'page' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	fetchSitePlans = require( 'state/sites/plans/actions' ).fetchSitePlans,
	getABTestVariation = require( 'lib/abtest' ).getABTestVariation,
	getCurrentPlan = require( 'lib/plans' ).getCurrentPlan,
	shouldFetchSitePlans = require( 'lib/plans' ).shouldFetchSitePlans,
	getPlansBySite = require( 'state/sites/plans/selectors' ).getPlansBySite,
	Gridicon = require( 'components/gridicon' ),
	isBusiness = require( 'lib/products-values' ).isBusiness,
	isJpphpBundle = require( 'lib/products-values' ).isJpphpBundle,
	isPremium = require( 'lib/products-values' ).isPremium,
	Main = require( 'components/main' ),
	Notice = require( 'components/notice' ),
	observe = require( 'lib/mixins/data-observe' ),
	paths = require( './paths' ),
	PlanList = require( 'components/plans/plan-list' ),
	PlanOverview = require( './plan-overview' ),
	preventWidows = require( 'lib/formatting' ).preventWidows,
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	UpgradesNavigation = require( 'my-sites/upgrades/navigation' );

var Plans = React.createClass( {
	displayName: 'Plans',

	mixins: [ observe( 'sites', 'plans' ) ],

	getInitialState: function() {
		return { openPlan: '' };
	},

	componentDidMount: function() {
		this.props.fetchSitePlans( this.props.sitePlans, this.props.sites.getSelectedSite() );
	},

	componentWillReceiveProps: function() {
		this.props.fetchSitePlans( this.props.sitePlans, this.props.sites.getSelectedSite() );
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
				<Gridicon icon="clipboard" size={ 18 } />
				{ this.translate( 'Compare Plans' ) }
			</a>
		);
	},

	redirectToDefault() {
		page.redirect( paths.plans( this.props.getSelectedSite().slug ) );
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

	renderTrialCopy: function() {
		var message,
			businessPlan,
			premiumPlan;

		if ( ! this.props.sitePlans.hasLoadedFromServer || getABTestVariation( 'freeTrials' ) !== 'offered' ) {
			return null;
		}

		businessPlan = find( this.props.sitePlans.data, isBusiness );
		premiumPlan = find( this.props.sitePlans.data, isPremium );

		if ( businessPlan.canStartTrial && premiumPlan.canStartTrial ) {
			message = this.translate( 'Try WordPress.com Premium or Business free for 14 days, no credit card required' );
		}

		if ( businessPlan.canStartTrial && ! premiumPlan.canStartTrial ) {
			message = this.translate( 'Try WordPress.com Business free for 14 days, no credit card required' );
		}

		if ( ! businessPlan.canStartTrial && premiumPlan.canStartTrial ) {
			message = this.translate( 'Try WordPress.com Premium free for 14 days, no credit card required' );
		}

		if ( ! businessPlan.canStartTrial && ! premiumPlan.canStartTrial ) {
			return null;
		}

		return (
			<div className="plans__trial-copy">
				<span className="plans__trial-copy-text">
					{ preventWidows( message, 2 ) }
				</span>
			</div>
		);
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
					path={ this.props.context.path }
					cart={ this.props.cart }
					destinationType={ this.props.context.params.destinationType }
					plan={ currentPlan }
					selectedSite={ selectedSite }
					store={ this.props.context.store } />
			);
		}

		return (
			<div>
				{ this.renderNotice() }

				<Main>
					<SidebarNavigation />

					<div id="plans" className="plans has-sidebar">
						<UpgradesNavigation
							path={ this.props.context.path }
							cart={ this.props.cart }
							selectedSite={ this.props.sites.getSelectedSite() } />

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
