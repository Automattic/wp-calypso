/**
 * External dependencies
 */
var React = require( 'react' ),
	connect = require( 'react-redux' ).connect,
	page = require( 'page' ),
	classNames = require( 'classnames' ),
	times = require( 'lodash/utility/times' ),
	property = require( 'lodash/utility/property' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	config = require( 'config' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	PlanFeatures = require( 'components/plans/plan-features' ),
	PlanHeader = require( 'components/plans/plan-header' ),
	PlanFeatureCell = require( 'components/plans/plan-feature-cell' ),
	analytics = require( 'analytics' ),
	HeaderCake = require( 'components/header-cake' ),
	fetchSitePlans = require( 'state/sites/plans/actions' ).fetchSitePlans,
	getPlansBySiteId = require( 'state/sites/plans/selectors' ).getPlansBySiteId,
	Card = require( 'components/card' ),
	featuresListUtils = require( 'lib/features-list/utils' );

var PlansCompare = React.createClass( {
	displayName: 'PlansCompare',

	mixins: [
		observe( 'features', 'plans' )
	],

	componentWillReceiveProps: function( nextProps ) {
		if ( ! this.props.isInSignup && this.props.selectedSite.ID !== nextProps.selectedSite.ID ) {
			this.props.fetchSitePlans( nextProps.selectedSite.ID );
		}
	},

	getDefaultProps: function() {
		return {
			isInSignup: false
		};
	},

	componentDidMount: function() {
		analytics.tracks.recordEvent( 'calypso_plans_compare', {
			isInSignup: this.props.isInSignup
		} );

		if ( ! this.props.isInSignup ) {
			this.props.fetchSitePlans( this.props.selectedSite.ID );
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

		if ( ! config.isEnabled( 'upgrades/free-trials' ) ) {
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

	comparisonTable: function() {
		var plansColumns,
			featuresList = this.props.features.get(),
			plans = this.props.plans.get(),
			site = this.props.selectedSite,
			showJetpackPlans = site ? site.jetpack : false;

		plans = plans.filter( function( plan ) {
			return ( showJetpackPlans === ( 'jetpack' === plan.product_type ) );
		} );

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
					<div className="plan-feature-column feature-list">
						<PlanHeader/>
						{ this.featureNames( featuresList ) }
					</div>
					{ this.featureColumns( site, plans, featuresList ) }
					{ this.freeTrialExceptionMessage( featuresList ) }
				</div>
			);
		}

		plansColumns = times( 4, function( i ) {
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
				{ plansColumns }
			</div>
		);
	},

	render: function() {
		return (
			<div className={ this.props.className }>
				{
					this.props.isInSignup
					? null
					: <SidebarNavigation />
				}
				<HeaderCake onClick={ this.goBack }>
					{ this.translate( 'Compare Plans' ) }
				</HeaderCake>
				<Card className="plans">
					{ this.comparisonTable() }
				</Card>
			</div>
		);
	}
} );

module.exports = connect(
	function mapStateToProps( state, props ) {
		if ( ! props.selectedSite ) {
			return { sitePlans: null };
		}

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
)( PlansCompare );
