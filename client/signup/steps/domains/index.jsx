/**
 * External dependencies
 */
var React = require( 'react' ),
	defer = require( 'lodash/defer' ),
	page = require( 'page' ),
	i18n = require( 'i18n-calypso' );

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
	Notice = require( 'components/notice' ),
	abtest = require( 'lib/abtest' ).abtest,
	signupUtils = require( 'signup/utils' );

module.exports = React.createClass( {
	displayName: 'DomainsStep',

	showGoogleApps: function() {
		page( signupUtils.getStepUrl( this.props.flowName, this.props.stepName, 'google', this.props.locale ) );
	},

	showDomainSearch: function() {
		page( signupUtils.getStepUrl( this.props.flowName, this.props.stepName, this.props.locale ) );
	},

	getMapDomainUrl: function() {
		return signupUtils.getStepUrl( this.props.flowName, this.props.stepName, 'mapping', this.props.locale );
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

	isPurchasingTheme: function() {
		return this.props.queryObject && this.props.queryObject.premium;
	},

	getThemeSlug: function() {
		return this.props.queryObject ? this.props.queryObject.theme : undefined;
	},

	getThemeArgs: function() {
		const themeSlug = this.getThemeSlug(),
			themeSlugWithRepo = this.getThemeSlugWithRepo(),
			themeItem = this.isPurchasingTheme()
			? cartItems.themeItem( themeSlug, 'signup-with-theme' )
			: undefined;

		return { themeSlug, themeSlugWithRepo, themeItem };
	},

	getThemeSlugWithRepo: function() {
		const themeSlug = this.getThemeSlug();
		if ( ! themeSlug ) {
			return undefined;
		}
		// Only allow free themes for now; a valid theme value here (free or premium) will cause a theme_switch by Headstart.
		return this.isPurchasingTheme() ? undefined : 'pub/' + themeSlug;
	},

	submitWithDomain: function( googleAppsCartItem ) {
		const suggestion = this.props.step.suggestion,
			isPurchasingItem = Boolean( suggestion.product_slug ),
			siteUrl = isPurchasingItem
				? suggestion.domain_name
				: suggestion.domain_name.replace( '.wordpress.com', '' ),
			domainItem = isPurchasingItem
				? cartItems.domainRegistration( {
					domain: suggestion.domain_name,
					productSlug: suggestion.product_slug
				} )
				: undefined;

		SignupActions.submitSignupStep( Object.assign( {
			processingMessage: this.translate( 'Adding your domain' ),
			stepName: this.props.stepName,
			domainItem,
			googleAppsCartItem,
			isPurchasingItem,
			siteUrl,
			stepSectionName: this.props.stepSectionName
		}, this.getThemeArgs() ), [], { domainItem } );

		this.props.goToNextStep();
	},

	handleAddMapping: function( sectionName, domain, state ) {
		const domainItem = cartItems.domainMapping( { domain } );
		const isPurchasingItem = true;

		SignupActions.submitSignupStep( Object.assign( {
			processingMessage: this.translate( 'Adding your domain mapping' ),
			stepName: this.props.stepName,
			[ sectionName ]: state,
			domainItem,
			isPurchasingItem,
			siteUrl: domain,
			stepSectionName: this.props.stepSectionName
		}, this.getThemeArgs() ) );

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
		const isPlansOnlyTest = abtest( 'domainsWithPlansOnly' ) === 'plansOnly';
		return (
			<RegisterDomainStep
				path={ this.props.path }
				initialState={ initialState }
				onAddDomain={ this.handleAddDomain }
				products={ this.state.products }
				basePath={ this.props.path }
				mapDomainUrl={ this.getMapDomainUrl() }
				onAddMapping={ this.handleAddMapping.bind( this, 'domainForm' ) }
				onSave={ this.handleSave.bind( this, 'domainForm' ) }
				offerMappingOption
				analyticsSection="signup"
				withPlansOnly={ isPlansOnlyTest }
				includeWordPressDotCom
				isSignupStep
				showExampleSuggestions={ ! ( 'developer' === this.props.flowName ) }
				suggestion={ this.props.queryObject ? this.props.queryObject.new : '' } />
		);
	},

	mappingForm: function() {
		const initialState = this.props.step ? this.props.step.mappingForm : undefined,
			initialQuery = this.props.step && this.props.step.domainForm && this.props.step.domainForm.lastQuery;

		return (
			<div className="domains-step__section-wrapper">
				<MapDomain
					initialState={ initialState }
					path={ this.props.path }
					onAddDomain={ this.handleAddDomain }
					onAddMapping={ this.handleAddMapping.bind( this, 'mappingForm' ) }
					onSave={ this.handleSave.bind( this, 'mappingForm' ) }
					productsList={ productsList }
					withPlansOnly={ abtest( 'domainsWithPlansOnly' ) === 'plansOnly' }
					initialQuery={ initialQuery }
					analyticsSection="signup" />
			</div>
		);
	},

	render: function() {
		let content;
		const backUrl = this.props.stepSectionName
			? signupUtils.getStepUrl( this.props.flowName, this.props.stepName, undefined, i18n.getLocaleSlug() )
			: undefined;

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
					<Notice status="is-error" showDismiss={ false }>
						{ this.props.step.errors.message }
					</Notice>
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
