import { isNewsletterOrLinkInBioFlow } from '@automattic/onboarding';
import { localize } from 'i18n-calypso';
import { defer, get, isEmpty } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import UseMyDomain from 'calypso/components/domains/use-my-domain';
import Notice from 'calypso/components/notice';
import {
	domainRegistration,
	themeItem,
	domainMapping,
	domainTransfer,
} from 'calypso/lib/cart-values/cart-items';
import {
	getDomainProductSlug,
	getDomainSuggestionSearch,
	getFixedDomainSearch,
} from 'calypso/lib/domains';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import { maybeExcludeEmailsStep } from 'calypso/lib/signup/step-actions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl, isPlanSelectionAvailableLaterInFlow } from 'calypso/signup/utils';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import {
	recordAddDomainButtonClick,
	recordAddDomainButtonClickInMapDomain,
	recordAddDomainButtonClickInTransferDomain,
	recordAddDomainButtonClickInUseYourDomain,
} from 'calypso/state/domains/actions';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { fetchUsernameSuggestion } from 'calypso/state/signup/optional-dependencies/actions';
import {
	removeStep,
	saveSignupStep,
	submitSignupStep,
} from 'calypso/state/signup/progress/actions';
import { isPlanStepExistsAndSkipped } from 'calypso/state/signup/progress/selectors';
import { setDesignType } from 'calypso/state/signup/steps/design-type/actions';
import { getDesignType } from 'calypso/state/signup/steps/design-type/selectors';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getExternalBackUrl } from './utils';
import './style.scss';

class DomainsStep extends Component {
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
		isReskinned: PropTypes.bool,
	};

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
				{
					domainItem,
					siteUrl: domain,
				}
			);

			props.goToNextStep();
		}
		this.setCurrentFlowStep = this.setCurrentFlowStep.bind( this );
		this.state = {
			currentStep: null,
		};
	}

	getLocale() {
		return ! this.props.userLoggedIn ? this.props.locale : '';
	}

	getUseYourDomainUrl = () => {
		return getStepUrl(
			this.props.flowName,
			this.props.stepName,
			'use-your-domain',
			this.getLocale()
		);
	};

	handleAddDomain = ( suggestion ) => {
		const stepData = {
			stepName: this.props.stepName,
			suggestion,
		};

		this.props.recordAddDomainButtonClick(
			suggestion.domain_name,
			this.getAnalyticsSection(),
			suggestion?.is_premium
		);
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
		const themeSlug = this.getThemeSlug();
		const themeSlugWithRepo = this.getThemeSlugWithRepo( themeSlug );
		const theme = this.isPurchasingTheme()
			? themeItem( themeSlug, 'signup-with-theme' )
			: undefined;

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

	isDependencyShouldHideFreePlanProvided = () => {
		/**
		 * This prop is used to supress providing the dependency - shouldHideFreePlan - when the plans step is in the current flow
		 */
		return (
			! this.props.forceHideFreeDomainExplainerAndStrikeoutUi &&
			this.props.isPlanSelectionAvailableLaterInFlow
		);
	};

	handleSkip = ( googleAppsCartItem, shouldHideFreePlan = false ) => {
		const tracksProperties = Object.assign(
			{
				section: this.getAnalyticsSection(),
				flow: this.props.flowName,
				step: this.props.stepName,
			},
			this.isDependencyShouldHideFreePlanProvided()
				? { should_hide_free_plan: shouldHideFreePlan }
				: {}
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

	handleDomainExplainerClick = () => {
		const hideFreePlan = true;
		this.handleSkip( undefined, hideFreePlan );
	};

	handleUseYourDomainClick = () => {
		this.props.recordUseYourDomainButtonClick( this.getAnalyticsSection() );
		page( this.getUseYourDomainUrl() );
	};

	submitWithDomain = ( googleAppsCartItem, shouldHideFreePlan = false ) => {
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

		maybeExcludeEmailsStep( {
			domainItem,
			resetSignupStep: this.props.removeStep,
			siteUrl: suggestion?.domain_name,
			stepName: 'emails',
			submitSignupStep: this.props.submitSignupStep,
		} );

		const siteAccentColor =
			this.props.flowName === 'newsletter' && this.props.queryObject?.siteAccentColor;

		this.props.submitSignupStep(
			Object.assign(
				{
					stepName: this.props.stepName,
					domainItem,
					googleAppsCartItem,
					isPurchasingItem,
					siteUrl,
					stepSectionName: this.props.stepSectionName,
					...( siteAccentColor && { siteAccentColor } ),
				},
				this.getThemeArgs()
			),
			Object.assign(
				{ domainItem },
				this.isDependencyShouldHideFreePlanProvided() ? { shouldHideFreePlan } : {},
				useThemeHeadstartItem
			)
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

	handleAddTransfer = ( { domain, authCode } ) => {
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
		const { flowName, isDomainOnly, siteType, signupDependencies } = this.props;

		// 'subdomain' flow coming from .blog landing pages
		if ( flowName === 'subdomain' ) {
			return true;
		}

		// newsletter users should get free .blog domain
		if ( flowName === 'newsletter' ) {
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
			// Users choose `Blog` as their site type
			'blog' === get( signupDependencies, 'siteType' ) ||
			'blog' === siteType
		) {
			return true;
		}

		const lastQuery = get( this.props.step, 'domainForm.lastQuery' );
		return typeof lastQuery === 'string' && lastQuery.includes( '.blog' );
	}

	shouldHideDomainExplainer = () => {
		const { flowName } = this.props;
		return [
			'free',
			'personal',
			'personal-monthly',
			'premium',
			'premium-monthly',
			'business',
			'business-monthly',
			'ecommerce',
			'ecommerce-monthly',
			'domain',
		].includes( flowName );
	};

	shouldHideUseYourDomain = () => {
		const { flowName } = this.props;
		return [ 'domain' ].includes( flowName );
	};

	shouldDisplayDomainOnlyExplainer = () => {
		const { flowName } = this.props;
		return [ 'domain' ].includes( flowName );
	};

	getSideContent = () => {
		const useYourDomain = ! this.shouldHideUseYourDomain() ? (
			<div className="domains__domain-side-content">
				<ReskinSideExplainer onClick={ this.handleUseYourDomainClick } type={ 'use-your-domain' } />
			</div>
		) : null;

		return (
			<div className="domains__domain-side-content-container">
				{ ! this.shouldHideDomainExplainer() && this.props.isPlanSelectionAvailableLaterInFlow && (
					<div className="domains__domain-side-content domains__free-domain">
						<ReskinSideExplainer
							onClick={ this.handleDomainExplainerClick }
							type={ 'free-domain-explainer' }
							flowName={ this.props.flowName }
						/>
					</div>
				) }
				{ useYourDomain }
				{ this.shouldDisplayDomainOnlyExplainer() && (
					<div className="domains__domain-side-content">
						<ReskinSideExplainer
							onClick={ this.handleDomainExplainerClick }
							type={ 'free-domain-only-explainer' }
						/>
					</div>
				) }
			</div>
		);
	};

	domainForm = () => {
		let initialState = {};
		if ( this.props.step ) {
			initialState = this.props.step.domainForm;
		}

		// If it's the first load, rerun the search with whatever we get from the query param or signup dependencies.
		const initialQuery =
			get( this.props, 'queryObject.new', '' ) ||
			get( this.props, 'signupDependencies.suggestedDomain' );

		// Search using the initial query but do not show the query on the search input field.
		const hideInitialQuery = get( this.props, 'queryObject.hide_initial_query', false ) === 'yes';

		if (
			// If we landed here from /domains Search or with a suggested domain.
			initialQuery &&
			this.searchOnInitialRender
		) {
			this.searchOnInitialRender = false;
			if ( initialState ) {
				initialState.searchResults = null;
				initialState.subdomainSearchResults = null;
				// If length is less than 2 it will not fetch any data.
				// filter before counting length
				initialState.loadingResults =
					getDomainSuggestionSearch( getFixedDomainSearch( initialQuery ) ).length >= 2;
				initialState.hideInitialQuery = hideInitialQuery;
			}
		}

		let showExampleSuggestions = this.props.showExampleSuggestions;
		if ( 'undefined' === typeof showExampleSuggestions ) {
			showExampleSuggestions = true;
		}

		const includeWordPressDotCom = this.props.includeWordPressDotCom ?? ! this.props.isDomainOnly;

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					key="domainForm"
					path={ this.props.path }
					initialState={ initialState }
					onAddDomain={ this.handleAddDomain }
					products={ this.props.productsList }
					basePath={ this.props.path }
					promoTlds={ this.props?.queryObject?.tld?.split( ',' ) }
					mapDomainUrl={ this.getUseYourDomainUrl() }
					transferDomainUrl={ this.getUseYourDomainUrl() }
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
					isPlanSelectionAvailableInFlow={ this.props.isPlanSelectionAvailableLaterInFlow }
					showExampleSuggestions={ showExampleSuggestions }
					suggestion={ initialQuery }
					designType={ this.getDesignType() }
					vendor={ getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: this.props.isDomainOnly,
						flowName: this.props.flowName,
					} ) }
					deemphasiseTlds={ this.props.flowName === 'ecommerce' ? [ 'blog' ] : [] }
					selectedSite={ this.props.selectedSite }
					showSkipButton={ this.props.showSkipButton }
					onSkip={ this.handleSkip }
					hideFreePlan={ this.handleSkip }
					forceHideFreeDomainExplainerAndStrikeoutUi={
						this.props.forceHideFreeDomainExplainerAndStrikeoutUi
					}
					isReskinned={ this.props.isReskinned }
					reskinSideContent={ this.getSideContent() }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	onUseMyDomainConnect = ( { domain } ) => {
		this.handleAddMapping( 'useYourDomainForm', domain );
	};

	insertUrlParams( params ) {
		if ( history.pushState ) {
			const searchParams = new URLSearchParams( window.location.search );

			Object.entries( params ).forEach( ( [ key, value ] ) => searchParams.set( key, value ) );
			const newUrl =
				window.location.protocol +
				'//' +
				window.location.host +
				window.location.pathname +
				'?' +
				decodeURIComponent( searchParams.toString() );
			window.history.pushState( { path: newUrl }, '', newUrl );
		}
	}

	setCurrentFlowStep( { mode, domain } ) {
		this.setState( { currentStep: mode }, () => {
			this.insertUrlParams( { step: this.state.currentStep, initialQuery: domain } );
		} );
	}

	useYourDomainForm = () => {
		const queryObject = parse( window.location.search.replace( '?', '' ) );
		const initialQuery = get( this.props.step, 'domainForm.lastQuery' ) || queryObject.initialQuery;

		return (
			<div className="domains__step-section-wrapper" key="useYourDomainForm">
				<CalypsoShoppingCartProvider>
					<UseMyDomain
						analyticsSection={ this.getAnalyticsSection() }
						basePath={ this.props.path }
						initialQuery={ initialQuery }
						initialMode={ queryObject.step ?? inputMode.domainInput }
						onNextStep={ this.setCurrentFlowStep }
						isSignupStep
						showHeader={ false }
						onTransfer={ this.handleAddTransfer }
						onConnect={ this.onUseMyDomainConnect }
					/>
				</CalypsoShoppingCartProvider>
			</div>
		);
	};

	getSubHeaderText() {
		const { flowName, isAllDomains, siteType, stepSectionName, isReskinned, translate } =
			this.props;

		if ( isAllDomains ) {
			return translate( 'Find the domain that defines you' );
		}

		if ( isNewsletterOrLinkInBioFlow( flowName ) ) {
			const components = {
				span: (
					// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
					<span
						role="button"
						className="tailored-flow-subtitle__cta-text"
						onClick={ this.handleDomainExplainerClick }
					/>
				),
			};
			return flowName === 'newsletter'
				? translate(
						'Help your Newsletter stand out with a custom domain. Not sure yet? {{span}}Decide later{{/span}}.',
						{ components }
				  )
				: translate(
						'Set your Link in Bio apart with a custom domain. Not sure yet? {{span}}Decide later{{/span}}.',
						{ components }
				  );
		}

		if ( isReskinned ) {
			return ! stepSectionName && translate( 'Enter some descriptive keywords to get started' );
		}

		const subHeaderPropertyName = 'signUpFlowDomainsStepSubheader';
		const onboardingSubHeaderCopy =
			siteType &&
			flowName === 'onboarding' &&
			getSiteTypePropertyValue( 'slug', siteType, subHeaderPropertyName );

		if ( onboardingSubHeaderCopy ) {
			return onboardingSubHeaderCopy;
		}

		return 'transfer' === this.props.stepSectionName || 'mapping' === this.props.stepSectionName
			? translate( 'Use a domain you already own with your new WordPress.com site.' )
			: translate( "Enter your site's name or some keywords that describe it to get started." );
	}

	getHeaderText() {
		const { headerText, isAllDomains, siteType, isReskinned, stepSectionName, translate } =
			this.props;

		if ( stepSectionName === 'use-your-domain' ) {
			return '';
		}

		if ( headerText ) {
			return headerText;
		}

		if ( isAllDomains ) {
			return translate( 'Your next big idea starts here' );
		}

		if ( isReskinned ) {
			return ! stepSectionName && translate( 'Choose a domain' );
		}

		const headerPropertyName = 'signUpFlowDomainsStepHeader';

		return getSiteTypePropertyValue( 'slug', siteType, headerPropertyName );
	}

	getAnalyticsSection() {
		return this.props.isDomainOnly ? 'domain-first' : 'signup';
	}

	isTailoredFlow() {
		return isNewsletterOrLinkInBioFlow( this.props.flowName );
	}

	renderContent() {
		let content;
		let sideContent;

		if ( 'use-your-domain' === this.props.stepSectionName ) {
			content = this.useYourDomainForm();
		}

		if ( ! this.props.stepSectionName || this.props.isDomainOnly ) {
			content = this.domainForm();
		}

		if ( ! this.props.stepSectionName && this.props.isReskinned && ! this.isTailoredFlow() ) {
			sideContent = this.getSideContent();
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
				className="domains__step-content domains__step-content-domain-step"
			>
				{ content }
				{ sideContent }
			</div>
		);
	}

	getPreviousStepUrl() {
		if ( 'use-your-domain' !== this.props.stepSectionName ) return null;

		const { step, ...queryValues } = parse( window.location.search.replace( '?', '' ) );
		const currentStep = step ?? this.state?.currentStep;

		let mode = inputMode.domainInput;
		switch ( currentStep ) {
			case null:
			case inputMode.domainInput:
				return null;

			case inputMode.transferOrConnect:
				mode = inputMode.domainInput;
				break;

			case inputMode.transferDomain:
			case inputMode.ownershipVerification:
				mode = inputMode.transferOrConnect;
				break;
		}
		return getStepUrl(
			this.props.flowName,
			this.props.stepName,
			'use-your-domain',
			this.getLocale(),
			{
				step: mode,
				...queryValues,
			}
		);
	}

	removeQueryParam( url ) {
		return url.split( '?' )[ 0 ];
	}

	render() {
		if ( this.skipRender ) {
			return null;
		}

		const { isAllDomains, translate, isReskinned } = this.props;
		const siteUrl = this.props.selectedSite?.URL;
		const siteSlug = this.props.queryObject?.siteSlug;
		const source = this.props.queryObject?.source;
		let backUrl;
		let backLabelText;
		let isExternalBackUrl = false;

		const previousStepBackUrl = this.getPreviousStepUrl();
		const sitesBackLabelText = translate( 'Back to Sites' );

		if ( previousStepBackUrl ) {
			backUrl = previousStepBackUrl;
		} else if ( isAllDomains ) {
			backUrl = domainManagementRoot();
			backLabelText = translate( 'Back to All Domains' );
		} else {
			backUrl = getStepUrl( this.props.flowName, this.props.stepName, null, this.getLocale() );

			if ( 'site' === source && siteUrl ) {
				backUrl = siteUrl;
				backLabelText = translate( 'Back to My Site' );
				isExternalBackUrl = true;
			} else if ( 'my-home' === source && siteSlug ) {
				backUrl = `/home/${ siteSlug }`;
				backLabelText = translate( 'Back to My Home' );
			} else if ( 'general-settings' === source && siteSlug ) {
				backUrl = `/settings/general/${ siteSlug }`;
				backLabelText = translate( 'Back to General Settings' );
			} else if ( 'sites-dashboard' === source ) {
				backUrl = '/sites';
				backLabelText = sitesBackLabelText;
			} else if ( backUrl === this.removeQueryParam( this.props.path ) ) {
				backUrl = '/sites/';
				backLabelText = sitesBackLabelText;
			}

			const externalBackUrl = getExternalBackUrl( source, this.props.stepSectionName );
			if ( externalBackUrl ) {
				backUrl = externalBackUrl;
				backLabelText = translate( 'Back' );
				// Solves route conflicts between LP and calypso (ex. /domains).
				isExternalBackUrl = true;
			}
		}

		const headerText = this.getHeaderText();
		const fallbackSubHeaderText = this.getSubHeaderText();

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
				shouldHideNavButtons={ this.isTailoredFlow() }
				stepContent={
					<div>
						{ ! this.props.productsLoaded && <QueryProductsList /> }
						{ this.renderContent() }
					</div>
				}
				allowBackFirstStep={ !! backUrl }
				backLabelText={ backLabelText }
				hideSkip={ true }
				goToNextStep={ this.handleSkip }
				align={ isReskinned ? 'left' : 'center' }
				isWideLayout={ isReskinned }
			/>
		);
	}
}

const submitDomainStepSelection = ( suggestion, section ) => {
	let domainType = 'domain_reg';
	if ( suggestion.is_free ) {
		domainType = 'wpcom_subdomain';
		if ( suggestion.domain_name.endsWith( '.blog' ) ) {
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
	( state, { steps, flowName } ) => {
		const productsList = getAvailableProductsList( state );
		const productsLoaded = ! isEmpty( productsList );
		const isPlanStepSkipped = isPlanStepExistsAndSkipped( state );
		const selectedSite = getSelectedSite( state );
		const eligibleForProPlan = isEligibleForProPlan( state, selectedSite?.ID );

		return {
			designType: getDesignType( state ),
			productsList,
			productsLoaded,
			siteType: getSiteType( state ),
			selectedSite,
			sites: getSitesItems( state ),
			isPlanSelectionAvailableLaterInFlow:
				( ! isPlanStepSkipped && isPlanSelectionAvailableLaterInFlow( steps ) ) ||
				[ 'pro', 'starter' ].includes( flowName ),
			userLoggedIn: isUserLoggedIn( state ),
			eligibleForProPlan,
		};
	},
	{
		recordAddDomainButtonClick,
		recordAddDomainButtonClickInMapDomain,
		recordAddDomainButtonClickInTransferDomain,
		recordAddDomainButtonClickInUseYourDomain,
		recordUseYourDomainButtonClick,
		removeStep,
		submitDomainStepSelection,
		setDesignType,
		saveSignupStep,
		submitSignupStep,
		recordTracksEvent,
		fetchUsernameSuggestion,
	}
)( localize( DomainsStep ) );
