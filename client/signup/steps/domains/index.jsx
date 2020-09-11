/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defer, endsWith, get, has, includes, isEmpty } from 'lodash';
import { localize, getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import MapDomainStep from 'components/domains/map-domain-step';
import TransferDomainStep from 'components/domains/transfer-domain-step';
import UseYourDomainStep from 'components/domains/use-your-domain-step';
import RegisterDomainStep from 'components/domains/register-domain-step';
import CartData from 'components/data/cart';
import { getStepUrl } from 'signup/utils';
import StepWrapper from 'signup/step-wrapper';
import {
	domainRegistration,
	themeItem,
	domainMapping,
	domainTransfer,
} from 'lib/cart-values/cart-items';
import {
	recordAddDomainButtonClick,
	recordAddDomainButtonClickInMapDomain,
	recordAddDomainButtonClickInTransferDomain,
	recordAddDomainButtonClickInUseYourDomain,
} from 'state/domains/actions';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { domainManagementRoot } from 'my-sites/domains/paths';
import Notice from 'components/notice';
import { getDesignType } from 'state/signup/steps/design-type/selectors';
import { setDesignType } from 'state/signup/steps/design-type/actions';
import { getSiteGoals } from 'state/signup/steps/site-goals/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getDomainProductSlug } from 'lib/domains';
import QueryProductsList from 'components/data/query-products-list';
import { getAvailableProductsList } from 'state/products-list/selectors';
import { getSuggestionsVendor } from 'lib/domains/suggestions';
import { getSite } from 'state/sites/selectors';
import { getVerticalForDomainSuggestions } from 'state/signup/steps/site-vertical/selectors';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import { isDomainStepSkippable } from 'signup/config/steps';
import { fetchUsernameSuggestion } from 'state/signup/optional-dependencies/actions';
import { isSitePreviewVisible, isPlanStepExistsAndSkipped } from 'state/signup/preview/selectors';
import { hideSitePreview, showSitePreview } from 'state/signup/preview/actions';
import { getABTestVariation } from 'lib/abtest';
import getSitesItems from 'state/selectors/get-sites-items';

/**
 * Style dependencies
 */
import './style.scss';

class DomainsStep extends React.Component {
	static propTypes = {
		forceDesignType: PropTypes.string,
		domainsWithPlansOnly: PropTypes.bool,
		flowName: PropTypes.string.isRequired,
		goToNextStep: PropTypes.func.isRequired,
		isDomainOnly: PropTypes.bool.isRequired,
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
		positionInFlow: PropTypes.number.isRequired,
		queryObject: PropTypes.object,
		step: PropTypes.object,
		stepName: PropTypes.string.isRequired,
		stepSectionName: PropTypes.string,
		selectedSite: PropTypes.object,
		vertical: PropTypes.string,
		isReskinned: PropTypes.bool,
	};

	getDefaultState = () => ( {
		previousStepSectionName: this.props.stepSectionName,
		suggestion: null,
	} );

	state = this.getDefaultState();

	constructor( props ) {
		super( props );

		const domain = get( props, 'queryObject.new', false );
		const search = get( props, 'queryObject.search', false ) === 'yes';
		const suggestedDomain = get( props, 'signupDependencies.suggestedDomain' );

		// If we landed anew from `/domains` and it's the `new-flow` variation
		// or there's a suggestedDomain from previous steps, always rerun the search.
		if ( ( search && props.path.indexOf( '?' ) !== -1 ) || suggestedDomain ) {
			this.searchOnInitialRender = true;
		}

		if (
			props.isDomainOnly &&
			domain &&
			! search && // Testing /domains sending to NUX for search
			// If someone has a better idea on how to figure if the user landed anew
			// Because we persist the signupDependencies, but still want the user to be able to go back to search screen
			props.path.indexOf( '?' ) !== -1
		) {
			this.skipRender = true;
			const productSlug = getDomainProductSlug( domain );
			const domainItem = domainRegistration( { productSlug, domain } );

			props.submitSignupStep(
				{
					stepName: props.stepName,
					domainItem,
					siteUrl: domain,
					isPurchasingItem: true,
					stepSectionName: props.stepSectionName,
				},
				{ domainItem }
			);

			props.goToNextStep();
		}
	}

	static getDerivedStateFromProps( nextProps ) {
		return {
			previousStepSectionName: nextProps.stepSectionName,
		};
	}

	/**
	 * Derive if the "plans" step actually will be visible to the customer in a given flow
	 */
	getIsPlanSelectionUnavailableInFlow = () => {
		const { steps, isPlanStepSkipped } = this.props;
		const isPlansStepExistsInFlow = steps?.some( ( planName ) => planName.includes( 'plans' ) );
		return ! isPlansStepExistsInFlow || isPlanStepSkipped;
	};

	componentDidUpdate( prevProps ) {
		// If the signup site preview is visible and there's a sub step, e.g., mapping, transfer, use-your-domain
		if ( prevProps.stepSectionName !== this.props.stepSectionName ) {
			if ( this.props.isSitePreviewVisible && this.props.stepSectionName ) {
				this.props.hideSitePreview();
			}

			if ( ! this.props.isSitePreviewVisible && ! this.props.stepSectionName ) {
				this.props.showSitePreview();
			}
		}
	}

	getMapDomainUrl = () => {
		return getStepUrl( this.props.flowName, this.props.stepName, 'mapping', this.props.locale );
	};

	getTransferDomainUrl = () => {
		return getStepUrl( this.props.flowName, this.props.stepName, 'transfer', this.props.locale );
	};

	getUseYourDomainUrl = () => {
		return getStepUrl(
			this.props.flowName,
			this.props.stepName,
			'use-your-domain',
			this.props.locale
		);
	};

	handleAddDomain = ( suggestion ) => {
		const stepData = {
			stepName: this.props.stepName,
			suggestion,
		};

		this.props.recordAddDomainButtonClick( suggestion.domain_name, this.getAnalyticsSection() );
		this.props.saveSignupStep( stepData );

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
			theme = this.isPurchasingTheme() ? themeItem( themeSlug, 'signup-with-theme' ) : undefined;

		return { themeSlug, themeSlugWithRepo, themeItem: theme };
	};

	getThemeSlugWithRepo = ( themeSlug ) => {
		if ( ! themeSlug ) {
			return undefined;
		}
		const repo = this.isPurchasingTheme() ? 'premium' : 'pub';
		return `${ repo }/${ themeSlug }`;
	};

	shouldUseThemeAnnotation() {
		return this.getThemeSlug() ? true : false;
	}

	handleSkip = ( googleAppsCartItem, shouldHideFreePlan = false ) => {
		const hideFreePlanTracksProp = this.getIsPlanSelectionUnavailableInFlow()
			? { should_hide_free_plan: shouldHideFreePlan }
			: {};

		const tracksProperties = Object.assign(
			{
				section: this.getAnalyticsSection(),
				flow: this.props.flowName,
				step: this.props.stepName,
			},
			hideFreePlanTracksProp
		);

		this.props.recordTracksEvent( 'calypso_signup_skip_step', tracksProperties );

		const stepData = {
			stepName: this.props.stepName,
			suggestion: undefined,
		};

		this.props.saveSignupStep( stepData );

		defer( () => {
			this.submitWithDomain( googleAppsCartItem, shouldHideFreePlan );
		} );
	};

	submitWithDomain = ( googleAppsCartItem, shouldHideFreePlan = false ) => {
		const shouldHideFreePlanItem = this.getIsPlanSelectionUnavailableInFlow()
			? { shouldHideFreePlan }
			: {};
		const shouldUseThemeAnnotation = this.shouldUseThemeAnnotation();
		const useThemeHeadstartItem = shouldUseThemeAnnotation
			? { useThemeHeadstart: shouldUseThemeAnnotation }
			: {};

		const suggestion = this.props.step.suggestion;

		const isPurchasingItem = suggestion && Boolean( suggestion.product_slug );

		const siteUrl =
			suggestion &&
			( isPurchasingItem
				? suggestion.domain_name
				: suggestion.domain_name.replace( '.wordpress.com', '' ) );

		const domainItem = isPurchasingItem
			? domainRegistration( {
					domain: suggestion.domain_name,
					productSlug: suggestion.product_slug,
			  } )
			: undefined;

		suggestion && this.props.submitDomainStepSelection( suggestion, this.getAnalyticsSection() );

		this.props.submitSignupStep(
			Object.assign(
				{
					stepName: this.props.stepName,
					domainItem,
					googleAppsCartItem,
					isPurchasingItem,
					siteUrl,
					stepSectionName: this.props.stepSectionName,
				},
				this.getThemeArgs()
			),
			Object.assign( { domainItem }, shouldHideFreePlanItem, useThemeHeadstartItem )
		);

		this.props.setDesignType( this.getDesignType() );
		this.props.goToNextStep();

		// Start the username suggestion process.
		siteUrl && this.props.fetchUsernameSuggestion( siteUrl.split( '.' )[ 0 ] );
	};

	handleAddMapping = ( sectionName, domain, state ) => {
		const domainItem = domainMapping( { domain } );
		const isPurchasingItem = true;
		const shouldUseThemeAnnotation = this.shouldUseThemeAnnotation();
		const useThemeHeadstartItem = shouldUseThemeAnnotation
			? { useThemeHeadstart: shouldUseThemeAnnotation }
			: {};

		this.props.recordAddDomainButtonClickInMapDomain( domain, this.getAnalyticsSection() );

		this.props.submitSignupStep(
			Object.assign(
				{
					stepName: this.props.stepName,
					[ sectionName ]: state,
					domainItem,
					isPurchasingItem,
					siteUrl: domain,
					stepSectionName: this.props.stepSectionName,
				},
				this.getThemeArgs()
			),
			Object.assign( { domainItem }, useThemeHeadstartItem )
		);

		this.props.goToNextStep();
	};

	handleAddTransfer = ( domain, authCode ) => {
		const domainItem = domainTransfer( {
			domain,
			extra: {
				auth_code: authCode,
				signup: true,
			},
		} );
		const isPurchasingItem = true;
		const shouldUseThemeAnnotation = this.shouldUseThemeAnnotation();
		const useThemeHeadstartItem = shouldUseThemeAnnotation
			? { useThemeHeadstart: shouldUseThemeAnnotation }
			: {};

		this.props.recordAddDomainButtonClickInTransferDomain( domain, this.getAnalyticsSection() );

		this.props.submitSignupStep(
			Object.assign(
				{
					stepName: this.props.stepName,
					transfer: {},
					domainItem,
					isPurchasingItem,
					siteUrl: domain,
					stepSectionName: this.props.stepSectionName,
				},
				this.getThemeArgs()
			),
			Object.assign( { domainItem }, useThemeHeadstartItem )
		);

		this.props.goToNextStep();
	};

	handleSave = ( sectionName, state ) => {
		this.props.saveSignupStep( {
			stepName: this.props.stepName,
			stepSectionName: this.props.stepSectionName,
			[ sectionName ]: state,
		} );
	};

	getDesignType = () => {
		if ( this.props.forceDesignType ) {
			return this.props.forceDesignType;
		}

		if ( this.props.signupDependencies && this.props.signupDependencies.designType ) {
			return this.props.signupDependencies.designType;
		}

		return this.props.designType;
	};

	shouldIncludeDotBlogSubdomain() {
		const { flowName, isDomainOnly, siteType, siteGoals, signupDependencies } = this.props;
		const siteGoalsArray = siteGoals ? siteGoals.split( ',' ) : [];

		// 'subdomain' flow coming from .blog landing pages
		if ( flowName === 'subdomain' ) {
			return true;
		}

		// 'blog' flow, starting with blog themes
		if ( flowName === 'blog' ) {
			return true;
		}

		// No .blog subdomains for domain only sites
		if ( isDomainOnly ) {
			return false;
		}

		// If we detect a 'blog' site type from Signup data
		if (
			// All flows where 'about' step is before 'domains' step, user picked only 'share' on the `about` step
			( siteGoalsArray.length === 1 && siteGoalsArray.indexOf( 'share' ) !== -1 ) ||
			// Users choose `Blog` as their site type
			'blog' === get( signupDependencies, 'siteType' ) ||
			'blog' === siteType
		) {
			return true;
		}

		const lastQuery = get( this.props.step, 'domainForm.lastQuery' );
		return typeof lastQuery === 'string' && lastQuery.includes( '.blog' );
	}

	domainForm = () => {
		let initialState = {};
		if ( this.state ) {
			initialState = this.state.domainForm;
		}
		if ( this.props.step ) {
			initialState = this.props.step.domainForm;
		}

		// If it's the first load, rerun the search with whatever we get from the query param or signup dependencies.
		const initialQuery =
			get( this.props, 'queryObject.new', '' ) ||
			get( this.props, 'signupDependencies.suggestedDomain' );

		if (
			// If we landed here from /domains Search or with a suggested domain.
			initialQuery &&
			this.searchOnInitialRender
		) {
			this.searchOnInitialRender = false;
			if ( initialState ) {
				initialState.searchResults = null;
				initialState.subdomainSearchResults = null;
				initialState.loadingResults = true;
			}
		}

		let showExampleSuggestions = this.props.showExampleSuggestions;
		if ( 'undefined' === typeof showExampleSuggestions ) {
			showExampleSuggestions = true;
		}

		let includeWordPressDotCom = this.props.includeWordPressDotCom;
		if ( 'undefined' === typeof includeWordPressDotCom ) {
			includeWordPressDotCom = ! this.props.isDomainOnly;
		}

		const hasCartItemInDependencyStore = has( this.props, 'signupDependencies.cartItem' );
		const cartItem = get( this.props, 'signupDependencies.cartItem', false );
		const hasSelectedFreePlan = hasCartItemInDependencyStore && ! cartItem;

		const selectedFreePlanInSwapFlow =
			'onboarding-plan-first' === this.props.flowName && hasSelectedFreePlan;
		const selectedPaidPlanInSwapFlow = 'onboarding-plan-first' === this.props.flowName && cartItem;
		const isPlanSelectionUnavailableInFlow = this.getIsPlanSelectionUnavailableInFlow();
		const registerDomainStep = (
			<RegisterDomainStep
				key="domainForm"
				path={ this.props.path }
				initialState={ initialState }
				onAddDomain={ this.handleAddDomain }
				products={ this.props.productsList }
				basePath={ this.props.path }
				mapDomainUrl={ this.getMapDomainUrl() }
				transferDomainUrl={ this.getTransferDomainUrl() }
				useYourDomainUrl={ this.getUseYourDomainUrl() }
				onAddMapping={ this.handleAddMapping.bind( this, 'domainForm' ) }
				onSave={ this.handleSave.bind( this, 'domainForm' ) }
				offerUnavailableOption={ ! this.props.isDomainOnly }
				isDomainOnly={ this.props.isDomainOnly }
				analyticsSection={ this.getAnalyticsSection() }
				domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
				includeWordPressDotCom={ includeWordPressDotCom }
				includeDotBlogSubdomain={ this.shouldIncludeDotBlogSubdomain() }
				isSignupStep
				isPlanSelectionUnavailableInFlow={ isPlanSelectionUnavailableInFlow }
				showExampleSuggestions={ showExampleSuggestions }
				suggestion={ initialQuery }
				designType={ this.getDesignType() }
				vendor={ getSuggestionsVendor( { isSignup: true, isDomainOnly: this.props.isDomainOnly } ) }
				deemphasiseTlds={ this.props.flowName === 'ecommerce' ? [ 'blog' ] : [] }
				selectedSite={ this.props.selectedSite }
				showSkipButton={ this.props.showSkipButton }
				vertical={ this.props.vertical }
				onSkip={ this.handleSkip }
				hideFreePlan={ this.handleSkip }
				selectedFreePlanInSwapFlow={ selectedFreePlanInSwapFlow }
				selectedPaidPlanInSwapFlow={ selectedPaidPlanInSwapFlow }
				isReskinned={ this.props.isReskinned }
			/>
		);

		if ( 'launch-site' === this.props.flowName ) {
			return <CartData>{ registerDomainStep }</CartData>;
		}

		return registerDomainStep;
	};

	mappingForm = () => {
		const initialState = this.props.step ? this.props.step.mappingForm : undefined,
			initialQuery =
				this.props.step && this.props.step.domainForm && this.props.step.domainForm.lastQuery;

		return (
			<div className="domains__step-section-wrapper" key="mappingForm">
				<MapDomainStep
					analyticsSection={ this.getAnalyticsSection() }
					initialState={ initialState }
					path={ this.props.path }
					onRegisterDomain={ this.handleAddDomain }
					onMapDomain={ this.handleAddMapping.bind( this, 'mappingForm' ) }
					onSave={ this.handleSave.bind( this, 'mappingForm' ) }
					products={ this.props.productsList }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
				/>
			</div>
		);
	};

	onTransferSave = ( state ) => {
		this.handleSave( 'transferForm', state );
	};

	transferForm = () => {
		const initialQuery = get( this.props.step, 'domainForm.lastQuery' );

		return (
			<div className="domains__step-section-wrapper" key="transferForm">
				<TransferDomainStep
					analyticsSection={ this.getAnalyticsSection() }
					basePath={ this.props.path }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
					isSignupStep
					mapDomainUrl={ this.getMapDomainUrl() }
					onRegisterDomain={ this.handleAddDomain }
					onTransferDomain={ this.handleAddTransfer }
					onSave={ this.onTransferSave }
					products={ this.props.productsList }
				/>
			</div>
		);
	};

	useYourDomainForm = () => {
		const initialQuery = get( this.props.step, 'domainForm.lastQuery' );

		return (
			<div className="domains__step-section-wrapper" key="useYourDomainForm">
				<UseYourDomainStep
					analyticsSection={ this.getAnalyticsSection() }
					basePath={ this.props.path }
					domainsWithPlansOnly={ this.props.domainsWithPlansOnly }
					initialQuery={ initialQuery }
					isSignupStep
					mapDomainUrl={ this.getMapDomainUrl() }
					transferDomainUrl={ this.getTransferDomainUrl() }
					products={ this.props.productsList }
				/>
			</div>
		);
	};

	getSubHeaderText() {
		const { flowName, isAllDomains, siteType, translate } = this.props;

		if ( isAllDomains ) {
			return translate( 'Find the domain that defines you' );
		}

		const subHeaderPropertyName = 'signUpFlowDomainsStepSubheader';
		const onboardingSubHeaderCopy =
			siteType &&
			includes( [ 'onboarding', 'ecommerce-onboarding' ], flowName ) &&
			getSiteTypePropertyValue( 'slug', siteType, subHeaderPropertyName );

		if ( onboardingSubHeaderCopy ) {
			return onboardingSubHeaderCopy;
		}

		return 'transfer' === this.props.stepSectionName || 'mapping' === this.props.stepSectionName
			? translate( 'Use a domain you already own with your new WordPress.com site.' )
			: translate( "Enter your site's name or some keywords that describe it to get started." );
	}

	getHeaderText() {
		const { headerText, isAllDomains, siteType, translate } = this.props;

		if ( isAllDomains ) {
			return translate( 'Your next big idea starts here' );
		}

		const headerPropertyName = 'signUpFlowDomainsStepHeader';

		return getSiteTypePropertyValue( 'slug', siteType, headerPropertyName ) || headerText;
	}

	getAnalyticsSection() {
		return this.props.isDomainOnly ? 'domain-first' : 'signup';
	}

	renderContent() {
		let content;

		if ( 'mapping' === this.props.stepSectionName ) {
			content = this.mappingForm();
		}

		if ( 'transfer' === this.props.stepSectionName ) {
			content = this.transferForm();
		}

		if ( 'use-your-domain' === this.props.stepSectionName ) {
			content = this.useYourDomainForm();
		}

		if ( ! this.props.stepSectionName || this.props.isDomainOnly ) {
			content = this.domainForm();
		}

		if ( this.props.step && 'invalid' === this.props.step.status ) {
			content = (
				<div className="domains__step-section-wrapper">
					<Notice status="is-error" showDismiss={ false }>
						{ this.props.step.errors.message }
					</Notice>
					{ content }
				</div>
			);
		}

		return (
			<div
				key={ this.props.step + this.props.stepSectionName }
				className="domains__step-content domains__step-content-domain-step-test"
			>
				{ content }
			</div>
		);
	}

	render() {
		if ( this.skipRender ) {
			return null;
		}

		const { flowName, isAllDomains, translate, sites } = this.props;
		const hasSite = Object.keys( sites ).length > 0;
		let backUrl, backLabelText, isExternalBackUrl;

		if ( 'transfer' === this.props.stepSectionName || 'mapping' === this.props.stepSectionName ) {
			backUrl = getStepUrl(
				this.props.flowName,
				this.props.stepName,
				'use-your-domain',
				getLocaleSlug()
			);
		} else if ( this.props.stepSectionName ) {
			backUrl = getStepUrl( this.props.flowName, this.props.stepName, undefined, getLocaleSlug() );
		} else if ( 0 === this.props.positionInFlow && hasSite ) {
			backUrl = '/sites/';
			backLabelText = translate( 'Back to My Sites' );

			if ( isAllDomains ) {
				backUrl = domainManagementRoot();
				backLabelText = translate( 'Back to All Domains' );
			}
		}

		// Override Back link if source parameter is found below
		const backUrlSourceOverrides = {
			'business-name-generator': '/business-name-generator',
			domains: '/domains',
		};
		const source = get( this.props, 'queryObject.source' );

		if ( source && backUrlSourceOverrides[ source ] ) {
			backUrl = backUrlSourceOverrides[ source ];
			backLabelText = translate( 'Back' );

			// Solves route conflicts between LP and calypso (ex. /domains).
			isExternalBackUrl = true;
		}

		const headerText = this.getHeaderText();
		const fallbackSubHeaderText = this.getSubHeaderText();
		const showSkip = isDomainStepSkippable( flowName );

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				backUrl={ backUrl }
				positionInFlow={ this.props.positionInFlow }
				headerText={ headerText }
				subHeaderText={ fallbackSubHeaderText }
				isExternalBackUrl={ isExternalBackUrl }
				fallbackHeaderText={ headerText }
				fallbackSubHeaderText={ fallbackSubHeaderText }
				stepContent={
					<div>
						{ ! this.props.productsLoaded && <QueryProductsList /> }
						{ this.renderContent() }
					</div>
				}
				showSiteMockups={ this.props.showSiteMockups }
				allowBackFirstStep={ !! backUrl }
				backLabelText={ backLabelText }
				hideSkip={ ! showSkip }
				isTopButtons={ showSkip }
				goToNextStep={ this.handleSkip }
				skipHeadingText={ translate( 'Not sure yet?' ) }
				skipLabelText={ translate( 'Choose a domain later' ) }
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
		type: domainType,
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
		recordTracksEvent( 'calypso_domain_search_submit_step', tracksObjects )
	);
};

export default connect(
	( state, ownProps ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );
		const isReskinned =
			'onboarding' === ownProps.flowName &&
			'reskinned' === getABTestVariation( 'reskinSignupFlow' );

		return {
			designType: getDesignType( state ),
			productsList,
			productsLoaded,
			siteGoals: getSiteGoals( state ),
			siteType: getSiteType( state ),
			vertical: getVerticalForDomainSuggestions( state ),
			selectedSite: getSite( state, ownProps.signupDependencies.siteSlug ),
			isSitePreviewVisible: isSitePreviewVisible( state ),
			sites: getSitesItems( state ),
			isReskinned,
			isPlanStepSkipped: isPlanStepExistsAndSkipped( state ),
		};
	},
	{
		recordAddDomainButtonClick,
		recordAddDomainButtonClickInMapDomain,
		recordAddDomainButtonClickInTransferDomain,
		recordAddDomainButtonClickInUseYourDomain,
		submitDomainStepSelection,
		setDesignType,
		saveSignupStep,
		submitSignupStep,
		recordTracksEvent,
		fetchUsernameSuggestion,
		hideSitePreview,
		showSitePreview,
	}
)( localize( DomainsStep ) );
