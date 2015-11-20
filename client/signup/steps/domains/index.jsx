/**
 * External dependencies
 */
var React = require( 'react' ),
	defer = require( 'lodash/function/defer' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var StepWrapper = require( 'signup/step-wrapper' ),
	productsList = require( 'lib/products-list' )(),
	cartItems = require( 'lib/cart-values' ).cartItems,
	SignupActions = require( 'lib/signup/actions' ),
	MapDomain = require( 'components/domains/map-domain' ),
	RegisterDomainStep = require( 'components/domains/register-domain-step' ),
	GoogleApps = require( 'components/upgrades/google-apps' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	signupUtils = require( 'signup/utils' );

module.exports = React.createClass( {
	displayName: 'DomainsStep',

	basePath: function() {
		return signupUtils.getStepUrl( this.props.flowName, this.props.stepName, this.props.locale );
	},

	showGoogleApps: function() {
		page( this.basePath() + '/google' );
	},

	showDomainSearch: function() {
		page( this.basePath() );
	},

	getInitialState: function() {
		return { products: productsList.get() };
	},

	componentDidMount: function() {
		productsList.on( 'change', this.refreshState );
	},

	componentWillUnmount: function() {
		productsList.off( 'change', this.refreshState );
	},

	refreshState: function() {
		this.setState( { products: productsList.get() } );
	},

	handleAddDomain: function( suggestion ) {
		const stepData = {
			stepName: this.props.stepName,
			suggestion
		};

		if ( this.props.step.suggestion &&
			this.props.step.suggestion.domain_name !== suggestion.domain_name ) {
			// overwrite the Google Apps data if the user goes back and selects a different domain
			stepData.googleAppsForm = undefined;
		}

		SignupActions.saveSignupStep( stepData );

		const isPurchasingItem = Boolean( suggestion.product_slug );

		defer( () => {
			// we must defer here because `submitWithDomain` also dispatches an action
			if ( isPurchasingItem ) {
				this.showGoogleApps();
			} else {
				this.submitWithDomain();
			}
		} );
	},

	submitWithDomain: function( googleAppsCartItem ) {
		const suggestion = this.props.step.suggestion,
			isPurchasingItem = Boolean( suggestion.product_slug ),
			siteUrl = isPurchasingItem ?
				suggestion.domain_name :
				suggestion.domain_name.replace( '.wordpress.com', '' ),
			domainItem = isPurchasingItem ?
				cartItems.domainRegistration( {
					domain: suggestion.domain_name,
					productSlug: suggestion.product_slug
				} ) :
				undefined;

		SignupActions.submitSignupStep( {
			processingMessage: this.translate( 'Adding your domain' ),
			stepName: this.props.stepName,
			domainItem,
			googleAppsCartItem,
			isPurchasingItem,
			siteUrl,
			stepSectionName: this.props.stepSectionName
		}, [], { domainItem } );

		this.props.goToNextStep();
	},

	handleAddMapping: function( sectionName, domain, state ) {
		const domainItem = cartItems.domainMapping( { domain } );

		SignupActions.submitSignupStep( {
			processingMessage: this.translate( 'Adding your domain mapping' ),
			stepName: this.props.stepName,
			[ sectionName ]: state,
			domainItem,
			isPurchasingItem: true,
			siteUrl: domain,
			stepSectionName: this.props.stepSectionName
		} );

		this.props.goToNextStep();
	},

	handleSave: function( sectionName, state ) {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
			stepSectionName: this.props.stepSectionName,
			[ sectionName ]: state
		} );
	},

	googleAppsForm: function() {
		return (
			<div className="domains-step__section-wrapper">
				<GoogleApps
					productsList={ productsList }
					domain={ this.props.step.suggestion.domain_name }
					onGoBack={ this.showDomainSearch }
					onClickSkip={ this.submitWithDomain }
					onAddGoogleApps={ this.submitWithDomain }
					onSave={ this.handleSave.bind( this, 'googleAppsForm' ) }
					initialState={ this.props.step.googleAppsForm }
					analyticsSection="signup" />
			</div>
		);
	},

	domainForm: function() {
		const initialState = this.props.step ? this.props.step.domainForm : this.state.domainForm;

		return (
			<RegisterDomainStep
				path={ this.props.path }
				initialState={ initialState }
				onAddDomain={ this.handleAddDomain }
				products={ this.state.products }
				buttonLabel={ this.translate( 'Select' ) }
				basePath={ this.props.path }
				onAddMapping={ this.handleAddMapping.bind( this, 'domainForm' ) }
				onSave={ this.handleSave.bind( this, 'domainForm' ) }
				offerMappingOption
				analyticsSection="signup"
				includeWordPressDotCom
				showExampleSuggestions />
		);
	},

	mappingForm: function() {
		const initialState = this.props.step ? this.props.step.mappingForm : undefined;

		return (
			<div className="domains-step__section-wrapper">
				<MapDomain
					initialState={ initialState }
					path={ this.props.path }
					onAddDomain={ this.handleAddDomain }
					onAddMapping={ this.handleAddMapping.bind( this, 'mappingForm' ) }
					onSave={ this.handleSave.bind( this, 'mappingForm' ) }
					productsList={ productsList }
					analyticsSection="signup" />
			</div>
		);
	},

	render: function() {
		let content;
		const backUrl = this.props.stepSectionName ?
			signupUtils.getStepUrl( this.props.flowName, this.props.stepName ) :
			undefined;

		if ( 'mapping' === this.props.stepSectionName ) {
			content = this.mappingForm();
		}

		if ( 'google' === this.props.stepSectionName ) {
			content = this.googleAppsForm();
		}

		if ( ! this.props.stepSectionName ) {
			content = this.domainForm();
		}

		if ( this.props.step && 'invalid' === this.props.step.status ) {
			content = (
				<div className="domains-step__section-wrapper">
					<SimpleNotice status='is-error' showDismiss={ false }>
						{ this.props.step.errors.message }
					</SimpleNotice>
					{ content }
				</div>
			);
		}

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				backUrl={ backUrl }
				positionInFlow={ this.props.positionInFlow }
				signupProgressStore={ this.props.signupProgressStore }
				subHeaderText={ this.translate( 'First up, let\'s find a domain.' ) }
				fallbackHeaderText={ this.translate( 'Let\'s find a domain.' ) }
				fallbackSubHeaderText={ this.translate( 'Choose a custom domain, or a free .wordpress.com address.' ) }
				stepContent={ content } />
		);
	}
} );
