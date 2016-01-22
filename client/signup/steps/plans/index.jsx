/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:steps:plans' ),
	isEmpty = require( 'lodash/lang/isEmpty' );

/**
 * Internal dependencies
 */
var productsList = require( 'lib/products-list' )(),
	getABTestVariation = require( 'lib/abtest' ).getABTestVariation,
	analytics = require( 'analytics' ),
	featuresList = require( 'lib/features-list' )(),
	plansList = require( 'lib/plans-list' )(),
	sitesList = require( 'lib/sites-list' )(),
	PlanList = require( 'components/plans/plan-list' ),
	PlansCompare = require( 'components/plans/plans-compare' ),
	SignupActions = require( 'lib/signup/actions' ),
	StepWrapper = require( 'signup/step-wrapper' ),
	Gridicon = require( 'components/gridicon' );

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
		return this.props.stepName + '/compare';
	},

	handleComparePlansLinkClick: function( linkLocation ) {
		analytics.tracks.recordEvent( 'calypso_signup_compare_plans_click', { location: linkLocation } );
	},

	isFreeTrialFlow: function() {
		return 'free-trial' === this.props.flowName;
	},

	plansList: function() {
		return (
			<div>
				<PlanList
					plans={ this.state.plans }
					sites={ sitesList }
					comparePlansUrl={ this.comparePlansUrl() }
					enableFreeTrials={ this.isFreeTrialFlow() }
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

	plansSelection: function() {
		let headerText = this.translate( 'Pick a plan that\'s right for you.' ),
			subHeaderText;

		if ( this.isFreeTrialFlow() && getABTestVariation( 'freeTrials' ) === 'offered' ) {
			subHeaderText = this.translate(
				'Try WordPress.com Premium or Business free for 14 days, no credit card required.'
			);
		} else {
			subHeaderText = this.translate(
				'Not sure which plan to choose? Take a look at our {{a}}plan comparison chart{{/a}}.', {
					components: { a: <a
						href={ this.comparePlansUrl() }
						onClick={ this.handleComparePlansLinkClick.bind( null, 'header' ) } /> }
				}
			);
		}

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
				stepContent={ this.plansList() } />
		);
	},

	plansCompare: function() {
		return <PlansCompare
			className="plans-step__compare"
			enableFreeTrials={ this.isFreeTrialFlow() }
			onSelectPlan={ this.onSelectPlan }
			isInSignup={ true }
			backUrl={ this.props.path.replace( '/compare', '' ) }
			plans={ plansList }
			features={ featuresList }
			productsList={ productsList } />;
	},

	render: function() {
		return <div className="plans plans-step has-no-sidebar">
			{
				'compare' === this.props.stepSectionName
				? this.plansCompare()
				: this.plansSelection()
			}
		</div>;
	}
} );
