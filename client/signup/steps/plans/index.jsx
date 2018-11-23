/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { parse as parseQs } from 'qs';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { cartItems } from 'lib/cart-values';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { getSiteBySlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import SignupActions from 'lib/signup/actions';
import StepWrapper from 'signup/step-wrapper';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import PlansSkipButton from 'components/plans/plans-skip-button';
import QueryPlans from 'components/data/query-plans';
import { FEATURE_UPLOAD_THEMES_PLUGINS } from '../../../lib/plans/constants';
import { planHasFeature } from '../../../lib/plans';

export class PlansStep extends Component {
	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	onSelectPlan = cartItem => {
		const {
				additionalStepData,
				stepSectionName,
				stepName,
				flowName,
				goToNextStep,
				translate,
				signupDependencies: { domainItem },
			} = this.props,
			privacyItem =
				cartItem && domainItem && cartItems.domainPrivacyProtection( { domain: domainItem.meta } );

		if ( cartItem ) {
			analytics.tracks.recordEvent( 'calypso_signup_plan_select', {
				product_slug: cartItem.product_slug,
				free_trial: cartItem.free_trial,
				from_section: stepSectionName ? stepSectionName : 'default',
			} );

			// If we're inside the store signup flow and the cart item is a Business or eCommerce Plan,
			// set a flag on it. It will trigger Automated Transfer when the product is being
			// activated at the end of the checkout process.
			if (
				flowName === 'ecommerce' &&
				planHasFeature( cartItem.product_slug, FEATURE_UPLOAD_THEMES_PLUGINS )
			) {
				cartItem.extra = Object.assign( cartItem.extra || {}, {
					is_store_signup: true,
				} );
			}
		} else {
			analytics.tracks.recordEvent( 'calypso_signup_free_plan_select', {
				from_section: stepSectionName ? stepSectionName : 'default',
			} );
		}

		const step = {
			processingMessage: isEmpty( cartItem )
				? translate( 'Free plan selected' )
				: translate( 'Adding your plan' ),
			stepName,
			stepSectionName,
			cartItem,
			privacyItem,
			...additionalStepData,
		};

		const providedDependencies = { cartItem, privacyItem };

		SignupActions.submitSignupStep( step, [], providedDependencies );

		goToNextStep();
	};

	getDomainName() {
		return (
			this.props.signupDependencies.domainItem && this.props.signupDependencies.domainItem.meta
		);
	}

	handleFreePlanButtonClick = () => {
		this.onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
	};

	plansFeaturesList() {
		const { hideFreePlan, isDomainOnly, selectedSite, customerType, flowName } = this.props;

		return (
			<div>
				<QueryPlans />

				<PlansFeaturesMain
					site={ selectedSite || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					onUpgradeClick={ this.onSelectPlan }
					showFAQ={ false }
					displayJetpackPlans={ false }
					domainName={ this.getDomainName() }
					customerType={ customerType || ( flowName === 'ecommerce' ? 'business' : undefined ) }
				/>
				{ /* The `hideFreePlan` means that we want to hide the Free Plan Info Column.
				   * In most cases, we want to show the 'Start with Free' PlansSkipButton instead --
				   * unless we've already selected an option that implies a paid plan.
				   * This is in particular true for domain names. */
				hideFreePlan &&
					! isDomainOnly &&
					! this.getDomainName() && <PlansSkipButton onClick={ this.handleFreePlanButtonClick } /> }
			</div>
		);
	}

	plansFeaturesSelection = () => {
		const { flowName, stepName, positionInFlow, signupProgress, translate } = this.props;

		const headerText = translate( "Pick a plan that's right for you." );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				signupProgress={ signupProgress }
				isWideLayout={ true }
				stepContent={ this.plansFeaturesList() }
			/>
		);
	};

	render() {
		const classes = classNames( 'plans plans-step', {
			'has-no-sidebar': true,
			'is-wide-layout': true,
		} );

		return <div className={ classes }>{ this.plansFeaturesSelection() }</div>;
	}
}

PlansStep.propTypes = {
	additionalStepData: PropTypes.object,
	goToNextStep: PropTypes.func.isRequired,
	hideFreePlan: PropTypes.bool,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	customerType: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default connect( ( state, { path, signupDependencies: { siteSlug } } ) => ( {
	// This step could be used to set up an existing site, in which case
	// some descendants of this component may display discounted prices if
	// they apply to the given site.
	isDomainOnly: isDomainOnlySite( state, getSelectedSiteId( state ) ),
	selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
	customerType: parseQs( path.split( '?' ).pop() ).customerType,
} ) )( localize( PlansStep ) );
