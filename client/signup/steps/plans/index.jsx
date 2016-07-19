/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:steps:plans' ),
	isEmpty = require( 'lodash/isEmpty' );

import classNames from 'classnames';

/**
 * Internal dependencies
 */
var productsList = require( 'lib/products-list' )(),
	analytics = require( 'lib/analytics' ),
	featuresList = require( 'lib/features-list' )(),
	plansList = require( 'lib/plans-list' )(),
	PlanList = require( 'components/plans/plan-list' ),
	PlansCompare = require( 'components/plans/plans-compare' ),
	SignupActions = require( 'lib/signup/actions' ),
	signupUtils = require( 'signup/utils' ),
	StepWrapper = require( 'signup/step-wrapper' ),
	Gridicon = require( 'components/gridicon' );

import { isEnabled } from 'config';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import QueryPlans from 'components/data/query-plans';
import { isPlanFeaturesEnabled } from 'lib/plans';

module.exports = React.createClass( {
	displayName: 'PlansStep',

	getInitialState: function() {
		return { plans: [] };
	},

	componentDidMount: function() {
		debug( 'PlansStep component mounted' );
		plansList.on( 'change', this.updatePlans );
		productsList.on( 'change', this.updatePlans );
		featuresList.on( 'change', this.updatePlans );

		this.updatePlans();
	},

	componentWillUnmount: function() {
		debug( 'PlansStep component unmounted' );
		plansList.off( 'change', this.updatePlans );
		productsList.off( 'change', this.updatePlans );
		featuresList.off( 'change', this.updatePlans );
	},

	updatePlans: function() {
		this.setState( {
			plans: plansList.get(),
			features: featuresList.get(),
			productsList: productsList.get()
		} );
	},

	onSelectPlan: function( cartItem ) {
		if ( cartItem ) {
			analytics.tracks.recordEvent( 'calypso_signup_plan_select', {
				product_slug: cartItem.product_slug,
				free_trial: cartItem.free_trial,
				from_section: this.props.stepSectionName ? this.props.stepSectionName : 'default'
			} );
		} else {
			analytics.tracks.recordEvent( 'calypso_signup_free_plan_select', {
				from_section: this.props.stepSectionName ? this.props.stepSectionName : 'default'
			} );
		}

		SignupActions.submitSignupStep( {
			processingMessage: isEmpty( cartItem ) ? this.translate( 'Free plan selected' ) : this.translate( 'Adding your plan' ),
			stepName: this.props.stepName,
			stepSectionName: this.props.stepSectionName,
			cartItem
		}, [], { cartItem } );

		this.props.goToNextStep();
	},

	comparePlansUrl: function() {
		return signupUtils.getStepUrl( this.props.flowName, this.props.stepName, 'compare', this.props.locale );
	},

	handleComparePlansLinkClick: function( linkLocation ) {
		analytics.tracks.recordEvent( 'calypso_signup_compare_plans_click', { location: linkLocation } );
	},

	plansList: function() {
		return (
			<div>
				<PlanList
					plans={ this.state.plans }
					comparePlansUrl={ this.comparePlansUrl() }
					hideFreePlan={ this.props.hideFreePlan }
					isInSignup={ true }
					onSelectPlan={ this.onSelectPlan } />
				<a
					href={ this.comparePlansUrl() }
					className="plans-step__compare-plans-link"
					onClick={ this.handleComparePlansLinkClick.bind( null, 'footer' ) }>
						<Gridicon icon="clipboard" size={ 18 } />
						{ this.translate( 'Compare Plans' ) }
				</a>
			</div>
		);
	},

	plansFeaturesList: function() {
		const {	hideFreePlan } = this.props;

		return (
			<div>
				<QueryPlans />

				<PlansFeaturesMain
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					onUpgradeClick={ this.onSelectPlan }
					showFAQ={ false } />
			</div>
		);
	},

	plansSelection: function() {
		const headerText = this.translate( 'Pick a plan that\'s right for you.' );
		const subHeaderText = this.translate(
				'Not sure which plan to choose? Take a look at our {{a}}plan comparison chart{{/a}}.', {
					components: { a: <a
						href={ this.comparePlansUrl() }
						onClick={ this.handleComparePlansLinkClick.bind( null, 'header' ) } /> }
				}
			);

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ headerText }
				subHeaderText={ subHeaderText }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ subHeaderText }
				signupProgressStore={ this.props.signupProgressStore }
				isWideLayout={ false }
				stepContent={ this.plansList() } />
		);
	},

	plansFeaturesSelection: function() {
		const {
			flowName,
			stepName,
			positionInFlow,
			signupProgressStore
		} = this.props;

		const translate = this.translate;

		const headerText = translate( "Pick a plan that's right for you." );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				signupProgressStore={ signupProgressStore }
				isWideLayout={ true }
				stepContent={ this.plansFeaturesList() } />
		);
	},

	plansCompare: function() {
		return <PlansCompare
			className="plans-step__compare"
			hideFreePlan={ this.props.hideFreePlan }
			onSelectPlan={ this.onSelectPlan }
			isInSignup={ true }
			backUrl={ this.props.path.replace( '/compare', '' ) }
			plans={ plansList }
			features={ featuresList }
			productsList={ productsList } />;
	},

	render: function() {
		const personalPlanTestEnabled = isEnabled( 'plans/personal-plan' );

		const classes = classNames( 'plans plans-step', {
			'has-no-sidebar': true,
			'is-wide-layout': isPlanFeaturesEnabled(),
			'has-personal-plan': personalPlanTestEnabled
		} );

		const renderPlans = () => (
			'compare' === this.props.stepSectionName
				? this.plansCompare()
				: this.plansSelection()
		);

		const renderPlansFeatures = () => ( this.plansFeaturesSelection() );

		return <div className={ classes }>
			{ isPlanFeaturesEnabled()
				? renderPlansFeatures()
				: renderPlans()
			}
		</div>;
	}
} );
