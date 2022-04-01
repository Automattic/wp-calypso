import { isEnabled } from '@automattic/calypso-config';
import {
	planHasFeature,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import PlanFeatures from 'calypso/my-sites/plan-features';
import { DESIGN_TYPE_STORE } from 'calypso/signup/constants';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
import { getSiteId } from 'calypso/state/sites/selectors';
import './style.scss';

export class PlansAtomicStoreStep extends Component {
	static propTypes = {
		additionalStepData: PropTypes.object,
		goToNextStep: PropTypes.func.isRequired,
		hideFreePlan: PropTypes.bool,
		siteId: PropTypes.number,
		stepName: PropTypes.string.isRequired,
		stepSectionName: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	onSelectPlan = ( cartItem ) => {
		const { additionalStepData, stepSectionName, stepName, goToNextStep, designType } = this.props;

		if ( cartItem ) {
			this.props.recordTracksEvent( 'calypso_signup_plan_select', {
				product_slug: cartItem.product_slug,
				free_trial: cartItem.free_trial,
				from_section: stepSectionName ? stepSectionName : 'default',
			} );

			// If we're inside the store signup flow and the cart item is a Business or eCommerce Plan,
			// set a flag on it. It will trigger Automated Transfer when the product is being
			// activated at the end of the checkout process.
			if (
				designType === DESIGN_TYPE_STORE &&
				planHasFeature( cartItem.product_slug, FEATURE_UPLOAD_THEMES_PLUGINS )
			) {
				cartItem.extra = Object.assign( cartItem.extra || {}, {
					is_store_signup: true,
				} );
			}
		} else {
			this.props.recordTracksEvent( 'calypso_signup_free_plan_select', {
				from_section: stepSectionName ? stepSectionName : 'default',
			} );
		}

		const step = {
			stepName,
			stepSectionName,
			cartItem,
			...additionalStepData,
		};

		const providedDependencies = { cartItem };

		this.props.submitSignupStep( step, providedDependencies );

		goToNextStep();
	};

	getDomainName() {
		return (
			this.props.signupDependencies.domainItem && this.props.signupDependencies.domainItem.meta
		);
	}

	plansFeaturesList() {
		const { hideFreePlan, siteId, designType } = this.props;

		const isPersonalPlanEnabled = isEnabled( 'plans/personal-plan' );

		let plans = [
			hideFreePlan ? null : PLAN_FREE,
			isPersonalPlanEnabled ? PLAN_PERSONAL : null,
			PLAN_PREMIUM,
			PLAN_BUSINESS,
			PLAN_ECOMMERCE,
		].filter( Boolean );

		if ( designType === DESIGN_TYPE_STORE ) {
			plans = [ PLAN_BUSINESS ];
		}

		return (
			<div>
				<QueryPlans />
				<QuerySitePlans siteId={ siteId } />

				<PlanFeatures
					plans={ plans }
					onUpgradeClick={ this.onSelectPlan }
					isInSignup={ true }
					siteId={ siteId }
					domainName={ this.getDomainName() }
				/>
			</div>
		);
	}

	plansFeaturesSelection() {
		const { flowName, stepName, positionInFlow, translate, designType } = this.props;

		let headerText = translate( "Pick a plan that's right for you." );

		if ( designType === DESIGN_TYPE_STORE ) {
			headerText = translate( "You'll need the Pro plan." );
		}

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				isWideLayout={ true }
				stepContent={ this.plansFeaturesList() }
			/>
		);
	}

	render() {
		const { designType } = this.props;

		const classes = classNames( 'plans plans-step', {
			'is-store-flow': designType === DESIGN_TYPE_STORE,
			'has-no-sidebar': true,
			'is-wide-layout': true,
		} );

		return <div className={ classes }>{ this.plansFeaturesSelection() }</div>;
	}
}

export default connect(
	( state, { signupDependencies: { siteSlug } } ) => ( {
		siteId: getSiteId( state, siteSlug ),
		designType: getDesignType( state ),
	} ),
	{ recordTracksEvent, submitSignupStep }
)( localize( PlansAtomicStoreStep ) );
