/**
 * External dependencies
 */
import React from 'react';
import times from 'lodash/times';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { filterPlansBySiteAndProps } from 'lib/plans';
import { getCurrentPlan } from 'lib/plans';
import { isJpphpBundle } from 'lib/products-values';
import Plan from 'components/plans/plan';

const PlanList = React.createClass( {
	getInitialState() {
		return { openPlan: '' };
	},

	openPlan( planId ) {
		this.setState( { openPlan: planId === this.state.openPlan ? '' : planId } );
	},

	render() {
		const isLoadingSitePlans = ! this.props.isInSignup && ! this.props.sitePlans.hasLoadedFromServer,
			site = this.props.site;

		let className = '',
			plans = this.props.plans,
			numberOfPlaceholders = 3,
			plansList;

		if ( this.props.hideFreePlan || ( site && site.jetpack ) ) {
			numberOfPlaceholders = this.props.showJetpackFreePlan ? 3 : 2;
			className = 'jetpack';
		}

		if ( plans.length === 0 || isLoadingSitePlans ) {
			plansList = times( numberOfPlaceholders, ( n ) => {
				return (
					<Plan
						className={ className }
						placeholder={ true }
						isInSignup={ this.props.isInSignup }
						key={ `plan-${ n }` } />
				);
			} );

			return (
				<div className="plan-list">
					{ plansList }
				</div>
			);
		}

		if ( ! this.props.isInSignup ) {
			// check if this site was registered via the JPPHP "Jetpack Start" program
			// if so, we want to display a message that this plan is managed via the hosting partner
			const currentPlan = getCurrentPlan( this.props.sitePlans.data );

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
			plans = filterPlansBySiteAndProps( plans, site, this.props.hideFreePlan, this.props.showJetpackFreePlan );

			plansList = plans.map( ( plan ) => {
				return (
					<Plan
						plan={ plan }
						sitePlans={ this.props.sitePlans }
						comparePlansUrl={ this.props.comparePlansUrl }
						hideDiscountMessage={ this.props.hideFreePlan }
						isInSignup={ this.props.isInSignup }
						key={ plan.product_id }
						open={ plan.product_id === this.state.openPlan }
						onOpen={ this.openPlan }
						onSelectPlan={ this.props.onSelectPlan }
						site={ site }
						cart={ this.props.cart }
						isSubmitting={ this.props.isSubmitting }
						onSelectFreeJetpackPlan={ this.props.onSelectFreeJetpackPlan } />
				);
			} );
		}

		return (
			<div className="plan-list">
				{ plansList }
			</div>
		);
	}
} );

export default PlanList;
