/**
 * External dependencies
 */
import { localize, getLocaleSlug } from 'i18n-calypso';
import { defer, endsWith } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import MapDomainStep from 'components/domains/map-domain-step';
import RegisterDomainStep from 'components/domains/register-domain-step';
import Notice from 'components/notice';
import { cartItems } from 'lib/cart-values';
import productsListFactory from 'lib/products-list';
import SignupActions from 'lib/signup/actions';
import { getUsernameSuggestion } from 'lib/signup/step-actions';
import StepWrapper from 'signup/step-wrapper';
import signupUtils from 'signup/utils';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { DOMAINS_WITH_PLANS_ONLY } from 'state/current-user/constants';
import { getCurrentUser, currentUserHasFlag } from 'state/current-user/selectors';
import { recordAddDomainButtonClick, recordAddDomainButtonClickInMapDomain } from 'state/domains/actions';
import { getSurveyVertical } from 'state/signup/steps/survey/selectors.js';

const productsList = productsListFactory();

class DomainsStep extends React.Component {
	static propTypes = {
		domainsWithPlansOnly: PropTypes.bool,
		flowName: PropTypes.string.isRequired,
		goToNextStep: PropTypes.func.isRequired,
		isDomainOnly: PropTypes.bool.isRequired,
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
		positionInFlow: PropTypes.number.isRequired,
		queryObject: PropTypes.object,
		signupProgress: PropTypes.array.isRequired,
		step: PropTypes.object,
		stepName: PropTypes.string.isRequired,
		stepSectionName: PropTypes.string,
	};

	static contextTypes = {
		store: PropTypes.object
	};

	state = { products: productsList.get() };

	showDomainSearch = () => {
		page( signupUtils.getStepUrl( this.props.flowName, this.props.stepName, this.props.locale ) );
	};

	getMapDomainUrl = () => {
		return signupUtils.getStepUrl( this.props.flowName, this.props.stepName, 'mapping', this.props.locale );
	};

	componentDidMount() {
		productsList.on( 'change', this.refreshState );
	}

	componentWillUnmount() {
		productsList.off( 'change', this.refreshState );
	}

	refreshState = () => {
		this.setState( { products: productsList.get() } );
	};

	handleAddDomain = suggestion => {
		const stepData = {
			stepName: this.props.stepName,
			suggestion,
		};

		this.props.recordAddDomainButtonClick( suggestion.domain_name, 'signup' );

		SignupActions.saveSignupStep( stepData );

		defer( () => {
			this.submitWithDomain();
		} );
	};

	isPurchasingTheme = () => {
		return this.props.queryObject && this.props.queryObject.premium;
	};

	getThemeSlug = () => {
		return this.props.queryObject ? this.props.queryObject.theme : undefined;
	};

	getThemeArgs = () => {
		const themeSlug = this.getThemeSlug(),
			themeSlugWithRepo = this.getThemeSlugWithRepo( themeSlug ),
			themeItem = this.isPurchasingTheme()
			? cartItems.themeItem( themeSlug, 'signup-with-theme' )
			: undefined;

		return { themeSlug, themeSlugWithRepo, themeItem };
	};

	getThemeSlugWithRepo = themeSlug => {
		if ( ! themeSlug ) {
			return undefined;
		}
		const repo = this.isPurchasingTheme() ? 'premium' : 'pub';
		return `${ repo }/${ themeSlug }`;
	};

	submitWithDomain = googleAppsCartItem => {
		const suggestion = this.props.step.suggestion,
			isPurchasingItem = Boolean( suggestion.product_slug ),
			siteUrl = isPurchasingItem
				? suggestion.domain_name
				: suggestion.domain_name.replace( '.wordpress.com', '' ),
			domainItem = isPurchasingItem
				? cartItems.domainRegistration( {
					domain: suggestion.domain_name,
					productSlug: suggestion.product_slug,
				} )
				: undefined;

		this.props.submitDomainStepSelection( suggestion, 'signup' );

		SignupActions.submitSignupStep( Object.assign( {
			processingMessage: this.props.translate( 'Adding your domain' ),
			stepName: this.props.stepName,
			domainItem,
			googleAppsCartItem,
			isPurchasingItem,
			siteUrl,
			stepSectionName: this.props.stepSectionName,
		}, this.getThemeArgs() ), [], { domainItem } );

		this.props.goToNextStep();

		// Start the username suggestion process.
		getUsernameSuggestion( siteUrl.split( '.' )[ 0 ], this.context.store );
	};

	handleAddMapping = ( sectionName, domain, state ) => {
		const domainItem = cartItems.domainMapping( { domain } );
		const isPurchasingItem = true;

		this.props.recordAddDomainButtonClickInMapDomain( domain, 'signup' );

		SignupActions.submitSignupStep( Object.assign( {
			processingMessage: this.props.translate( 'Adding your domain mapping' ),
			stepName: this.props.stepName,
			[ sectionName ]: state,
			domainItem,
			isPurchasingItem,
			siteUrl: domain,
			stepSectionName: this.props.stepSectionName,
		}, this.getThemeArgs() ) );

		this.props.goToNextStep();
	};

	handleSave = ( sectionName, state ) => {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
			stepSectionName: this.props.stepSectionName,
			[ sectionName ]: state,
		} );
	};

	domainForm = () => {
		const initialState = this.props.step ? this.props.step.domainForm : this.state.domainForm;
		const includeDotBlogSubdomain = ( this.props.flowName === 'subdomain' );

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
				offerMappingOption={ ! this.props.isDomainOnly }
				analyticsSection="signup"
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				includeWordPressDotCom={ ! this.props.isDomainOnly }
				includeDotBlogSubdomain={ includeDotBlogSubdomain }
				isSignupStep
				showExampleSuggestions
				surveyVertical={ this.props.surveyVertical }
				suggestion={ this.props.queryObject ? this.props.queryObject.new : '' }
				designType={ this.props.signupDependencies && this.props.signupDependencies.designType }
			/>
		);
	};

	mappingForm = () => {
		const initialState = this.props.step ? this.props.step.mappingForm : undefined,
			initialQuery = this.props.step && this.props.step.domainForm && this.props.step.domainForm.lastQuery;

		return (
			<div className="domains-step__section-wrapper">
				<MapDomainStep
					initialState={ initialState }
					path={ this.props.path }
					onRegisterDomain={ this.handleAddDomain }
					onMapDomain={ this.handleAddMapping.bind( this, 'mappingForm' ) }
					onSave={ this.handleSave.bind( this, 'mappingForm' ) }
					products={ productsList.get() }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
					analyticsSection="signup"
				/>
			</div>
		);
	};

	render() {
		let content;
		const { translate } = this.props;
		const backUrl = this.props.stepSectionName
			? signupUtils.getStepUrl( this.props.flowName, this.props.stepName, undefined, getLocaleSlug() )
			: undefined;

		if ( 'mapping' === this.props.stepSectionName ) {
			content = this.mappingForm();
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
				signupProgress={ this.props.signupProgress }
				subHeaderText={ translate( 'First up, let\'s find a domain.' ) }
				fallbackHeaderText={ translate( 'Let\'s give your site an address.' ) }
				fallbackSubHeaderText={ translate(
					'Enter your site\'s name, or some key words that describe it - ' +
					'we\'ll use this to create your new site\'s address.' ) }
				stepContent={ content }
			/>
		);
	}
}

const submitDomainStepSelection = ( suggestion, section ) => {
	let domainType = 'domain_reg';
	if ( suggestion.is_free ) {
		domainType = 'wpcom_subdomain';
		if ( endsWith( suggestion.domain_name, '.blog' ) ) {
			domainType = 'dotblog_subdomain';
		}
	}

	const tracksObjects = {
		domain_name: suggestion.domain_name,
		section,
		type: domainType
	};
	if ( suggestion.isRecommended ) {
		tracksObjects.label = 'recommended';
	}
	if ( suggestion.isBestAlternative ) {
		tracksObjects.label = 'best-alternative';
	}

	return composeAnalytics(
		recordGoogleEvent(
			'Domain Search',
			`Submitted Domain Selection for a ${ domainType } on a Domain Registration`,
			'Domain Name',
			suggestion.domain_name
		),
		recordTracksEvent(
			'calypso_domain_search_submit_step',
			tracksObjects
		)
	);
};

export default connect(
	( state ) => ( {
		// no user = DOMAINS_WITH_PLANS_ONLY
		domainsWithPlansOnly: getCurrentUser( state ) ? currentUserHasFlag( state, DOMAINS_WITH_PLANS_ONLY ) : true,
		surveyVertical: getSurveyVertical( state ),
	} ),
	{
		recordAddDomainButtonClick,
		recordAddDomainButtonClickInMapDomain,
		submitDomainStepSelection,
	}
)( localize( DomainsStep ) );
