/**
 * External dependencies
 */
var React = require( 'react' ),
	times = require( 'lodash/utility/times' );

/**
 * Internal dependencies
 */
var Plan = require( 'components/plans/plan' ),
	Card = require( 'components/card' ),
	abtest = require( 'lib/abtest' ).abtest,
	isJpphpBundle = require( 'lib/products-values' ).isJpphpBundle,
	getCurrentPlan = require( 'lib/plans' ).getCurrentPlan;

module.exports = React.createClass( {
	displayName: 'PlanList',

	getInitialState: function() {
		return { openPlan: '' };
	},

	openPlan: function( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	render: function() {
		var plans = this.props.plans,
			showJetpackPlans = false,
			isLoadingSitePlans = ! this.props.isInSignup && ! this.props.sitePlans.hasLoadedFromServer,
			site,
			plansList,
			currentPlan;

		if ( plans.length === 0 || isLoadingSitePlans ) {
			plansList = times( 3, function( n ) {
				return (
					<Plan placeholder={ true }
						isInSignup={ this.props.isInSignup }
						key={ `plan-${ n }` } />
				);
			}, this );

			return (
				<div className="plans-list">{ plansList }</div>
			);
		}

		if ( this.props.sites ) {
			site = this.props.sites.getSelectedSite();
			showJetpackPlans = site && site.jetpack;
		}

		if ( ! this.props.isInSignup ) {
			// check if this site was registered via the JPPHP "Jetpack Start" program
			// if so, we want to display a message that this plan is managed via the hosting partner
			currentPlan = getCurrentPlan( this.props.sitePlans.data );
			if ( isJpphpBundle( currentPlan ) ) {
				return (
					<Card>
						<p>
							{
								this.translate( 'This plan is managed by your web host. ' +
									'Please log into your host\'s control panel to manage subscription ' +
									'and billing information.' )
							}
						</p>
					</Card>
				);
			}
		}

		if ( plans.length > 0 ) {
			plans = plans.filter( function( plan ) {
				return ( showJetpackPlans === ( 'jetpack' === plan.product_type ) );
			} );

			// If showing Jetpack plans remove the first item (Free)
			if ( site && site.jetpack ) {
				plans.shift();
			}

			plansList = plans.map( function( plan ) {
				return (
					<Plan
						plan={ plan }
						sitePlans={ this.props.sitePlans }
						comparePlansUrl={ this.props.comparePlansUrl }
						isInSignup={ this.props.isInSignup }
						key={ plan.product_id }
						open={ plan.product_id === this.state.openPlan }
						onOpen={ this.openPlan }
						onSelectPlan={ this.props.onSelectPlan }
						site={ site }
						enableFreeTrials={ this.props.enableFreeTrials }
						cart={ this.props.cart } />
				);
			}, this );
		} else {
			plansList = times( 3, function( n ) {
				return (
					<Plan placeholder={ true }
						isInSignup={ this.props.isInSignup }
						key={ `plan-${ n }` } />
				);
			}, this );
		}

		var aaMarkup;
		if ( abtest( 'plansPageBusinessAATest' ) === 'originalA' ) {
			aaMarkup = plansList;
		} else {
			aaMarkup = plansList;
		}

		return <div className="plan-list">{ aaMarkup }</div>;
	}
} );
