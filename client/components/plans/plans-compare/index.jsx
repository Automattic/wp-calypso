/**
 * External dependencies
 */
var React = require( 'react' ),
	connect = require( 'react-redux' ).connect,
	page = require( 'page' ),
	classNames = require( 'classnames' ),
	times = require( 'lodash/times' ),
	property = require( 'lodash/property' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	getABTestVariation = require( 'lib/abtest' ).getABTestVariation,
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	PlanFeatures = require( 'components/plans/plan-features' ),
	PlanHeader = require( 'components/plans/plan-header' ),
	PlanFeatureCell = require( 'components/plans/plan-feature-cell' ),
	analytics = require( 'analytics' ),
	HeaderCake = require( 'components/header-cake' ),
	fetchSitePlans = require( 'state/sites/plans/actions' ).fetchSitePlans,
	getPlansBySite = require( 'state/sites/plans/selectors' ).getPlansBySite,
	Card = require( 'components/card' ),
	featuresListUtils = require( 'lib/features-list/utils' ),
	filterPlansBySiteAndProps = require( 'lib/plans' ).filterPlansBySiteAndProps,
	NavItem = require( 'components/section-nav/item' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	SectionNav = require( 'components/section-nav' ),
	shouldFetchSitePlans = require( 'lib/plans' ).shouldFetchSitePlans;

var PlansCompare = React.createClass( {
	displayName: 'PlansCompare',

	mixins: [
		observe( 'features', 'plans' )
	],

	componentWillReceiveProps: function( nextProps ) {
		this.props.fetchSitePlans( nextProps.sitePlans, nextProps.selectedSite );
	},

	getInitialState: function() {
		return {
			currentPlan: 'premium'
		}
	},

	getDefaultProps: function() {
		return {
			isInSignup: false
		};
	},

	componentDidMount: function() {
		analytics.tracks.recordEvent( 'calypso_plans_compare', {
			is_in_signup: this.props.isInSignup
		} );

		if ( ! this.props.isInSignup ) {
			this.props.fetchSitePlans( this.props.sitePlans, this.props.selectedSite );
		}
	},

	recordViewAllPlansClick: function() {
		analytics.ga.recordEvent( 'Upgrades', 'Clicked View All Plans' );
	},

	goBack: function() {
		var selectedSite = this.props.selectedSite,
			plansLink = '/plans';

		if ( this.props.backUrl ) {
			return page( this.props.backUrl );
		}

		if ( selectedSite ) {
			plansLink += '/' + selectedSite.slug;
		}

		this.recordViewAllPlansClick();
		page( plansLink );
	},

	featureNames: function( featuresList ) {
		return featuresList.map( function( feature ) {
			return (
				<PlanFeatureCell key={ feature.product_slug } title={ feature.description }>
					{ feature.title } { this.freeTrialExceptionMarker( feature ) }
				</PlanFeatureCell>
			);
		}, this );
	},

	featureColumns: function( site, plans, featuresList ) {
		return plans.map( function( plan ) {
			return (
				<PlanFeatures
					enableFreeTrials={ this.props.enableFreeTrials }
					onSelectPlan={ this.props.onSelectPlan }
					isInSignup={ this.props.isInSignup }
					key={ plan.product_id }
					plan={ plan }
					site={ site }
					cart={ this.props.cart }
					features={ featuresList }
					sitePlans={ this.props.sitePlans } />
			);
		}, this );
	},

	showFreeTrialException: function() {
		const hasTrial = this.props.selectedSite
				? this.props.selectedSite.plan.free_trial
				: false,
			canStartTrial = this.props.sitePlans && this.props.sitePlans.hasLoadedFromServer
				? this.props.sitePlans.data.some( property( 'canStartTrial' ) )
				: false;

		if ( getABTestVariation( 'freeTrials' ) !== 'offered' ) {
			return false;
		}

		// always show if the user is currently in trial
		if ( hasTrial ) {
			return true;
		}

		// show if the site is eligible for a trial (it never had a free trial before)
		// and free trial is enabled for this component
		if ( canStartTrial && this.props.enableFreeTrials ) {
			return true;
		}

		// show if we are in signup and free trial is enabled for this component
		if ( this.props.isInSignup && this.props.enableFreeTrials ) {
			return true;
		}

		return false;
	},

	freeTrialExceptionMarker: function( feature ) {
		if ( this.showFreeTrialException() && featuresListUtils.featureNotPartOfTrial( feature ) ) {
			return '*';
		}

		return null;
	},

	freeTrialExceptionMessage: function( featuresList ) {
		if ( this.showFreeTrialException() && featuresList.some( featuresListUtils.featureNotPartOfTrial ) ) {
			return (
				<div className="plans-compare__free-trial-exception-message">
					{ this.translate( '* Not included during the free trial period' ) }
				</div>
			);
		}

		return null;
	},

	getComparisonTableClasses: function() {
		var comparisonTableClasses = {
			'plans-compare__columns': true,
		};

		comparisonTableClasses[ this.state.currentPlan ] = true;
		return comparisonTableClasses;
	},

	comparisonTable: function() {
		var plansColumns,
			featuresList = this.props.features.get(),
			numberOfPlaceholders = 4,
			plans = this.props.plans.get(),
			site = this.props.selectedSite;

		plans = filterPlansBySiteAndProps( plans, site, this.props.hideFreePlan );

		if ( this.props.hideFreePlan || ( site && site.jetpack ) ) {
			numberOfPlaceholders = 3;
		}

		if ( this.props.features.hasLoadedFromServer() && (
			this.props.isInSignup || ! this.props.selectedSite || ( this.props.sitePlans && this.props.sitePlans.hasLoadedFromServer ) )
		) {
			// Remove features not supported by any plan
			featuresList = featuresList.filter( function( feature ) {
				var keepFeature = false;
				plans.forEach( function( plan ) {
					if ( plan.product_id in feature ) {
						keepFeature = true;
					}
				} );
				return keepFeature;
			} );

			return (
				<div className="plans-compare">
					<div className={ classNames( this.getComparisonTableClasses() ) }>
						<div className="plan-feature-column feature-list">
							<PlanHeader/>
							{ this.featureNames( featuresList ) }
						</div>
						{ this.featureColumns( site, plans, featuresList ) }
					</div>
					{ this.freeTrialExceptionMessage( featuresList ) }
				</div>
			);
		}

		plansColumns = times( numberOfPlaceholders, function( i ) {
			var planFeatures,
				classes = {
					'plan-feature-column': true,
					'is-placeholder': true,
					'feature-list': i === 0,
					'plan-features': i > 0
				};

			planFeatures = times( 5, function( j ) {
				return (
					<PlanFeatureCell key={ 'cell-' + i + '-' + j }>
						<span></span>
					</PlanFeatureCell>
				);
			} );

			return (
				<div className={ classNames( classes ) } key={ 'column-' + i }>
					<PlanHeader isPlaceholder={ true }/>
					{ planFeatures }
				</div>
			);
		} );

		return (
			<div className="plans-compare">
				<div className="plans-compare__columns">
					{ plansColumns }
				</div>
			</div>
		);
	},

	setPlan: function( plan ) {
		this.setState( {
			'currentPlan': plan
		} );
	},

	sectionNavigationForMobile() {
		return (
			<span className="plans-compare__section-navigation">
				<SectionNav>
					<NavTabs>
						<NavItem onClick={ this.setPlan.bind( this, 'free' ) }>
							{ this.translate( 'Free' ) }
						</NavItem>
						<NavItem onClick={ this.setPlan.bind( this, 'premium' ) }>
							{ this.translate( 'Premium' ) }
						</NavItem>
						<NavItem onClick={ this.setPlan.bind( this, 'business' ) }>
							{ this.translate( 'Business' ) }
						</NavItem>
					</NavTabs>
				</SectionNav>
			</span>
		);
	},

	render: function() {
		var compareString = this.translate( 'Compare Plans' );

		if ( this.props.selectedSite && this.props.selectedSite.jetpack ) {
			compareString = this.translate( 'Compare Options' );
		}

		return (
			<div className={ this.props.className }>
				{
					this.props.isInSignup
					? null
					: <SidebarNavigation />
				}
				<HeaderCake onClick={ this.goBack }>
					{ compareString }
				</HeaderCake>
				{ this.sectionNavigationForMobile() }
				<Card className="plans">
					{ this.comparisonTable() }
				</Card>
			</div>
		);
	}
} );

module.exports = connect(
	function mapStateToProps( state, props ) {
		return {
			sitePlans: getPlansBySite( state, props.selectedSite )
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
)( PlansCompare );
