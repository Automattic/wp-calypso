/* eslint-disable wpcalypso/jsx-classname-namespace */

import { StepContainer, isNewsletterOrLinkInBioFlow } from '@automattic/onboarding';
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { defer, get, isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import {
	getDomainProductSlug,
	getDomainSuggestionSearch,
	getFixedDomainSearch,
} from 'calypso/lib/domains';
import { maybeExcludeEmailsStep } from 'calypso/lib/signup/step-actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import {
	domainRegistration,
	themeItem,
	domainMapping,
	domainTransfer,
} from 'calypso/lib/cart-values/cart-items';
import { useI18n } from '@wordpress/react-i18n';
import { getStepUrl } from 'calypso/signup/utils';
import { setDesignType } from 'calypso/state/signup/steps/design-type/actions';
import { fetchUsernameSuggestion } from 'calypso/state/signup/optional-dependencies/actions';
import {
	recordAddDomainButtonClick,
	recordAddDomainButtonClickInMapDomain,
	recordAddDomainButtonClickInTransferDomain,
	recordAddDomainButtonClickInUseYourDomain,
} from 'calypso/state/domains/actions';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import {
	removeStep,
	saveSignupStep,
	submitSignupStep,
} from 'calypso/state/signup/progress/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
import type { Step } from '../../types';
import FormattedHeader from 'calypso/components/formatted-header';
import { useTranslate } from 'i18n-calypso';

import './styles.scss';
import { useState } from 'react';
import { Search } from './types';

const DomainsStep: Step = function DomainsStep( { navigation, flow } ) {
	const { productsList, signupDependencies } = useSelector( ( state ) => {
		return {
			productsList: getAvailableProductsList( state ),
			signupDependencies: getSignupDependencyStore( state ),
		};
	} );
	const { siteTitle, siteAccentColor } = useSelect( ( select ) => {
		return {
			siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
			siteAccentColor: select( ONBOARD_STORE ).getSelectedSiteAccentColor(),
		};
	} );
	const { __ } = useI18n();
	// const { productsList, signupDependencies, userLoggedIn, selectedSite } = useSelector(
	// 	( state ) => {
	// 		return {
	// 			productsList: getAvailableProductsList( state ),
	// 			signupDependencies: getSignupDependencyStore( state ),
	// 			userLoggedIn: isUserLoggedIn( state ),
	// 			selectedSite: getSelectedSite( state ),
	// 		};
	// 	}
	// );
	const [ searchOnInitialRender, setSearchOnInitialRender ] = useState( false );

	const dispatch = useDispatch();

	const isDomainOnly = false; //useSelect( ( select ) => select( ONBOARD_STORE ) ).getIsDomainOnly();
	const stepSectionName = undefined;
	const forceHideFreeDomainExplainerAndStrikeoutUi = undefined;
	const isReskinned = true;
	const isAllDomains = false;
	const forceDesignType = undefined;
	const hideInitialQuery = true;
	const premium = undefined;
	const designType = undefined;
	const domainsWithPlansOnly = true;
	const tld = undefined;
	const theme = undefined;
	const siteType = '';
	const lastQuery = '';
	const showSkipButton = undefined;
	const isPlanSelectionAvailableLaterInFlow = true;
	let showExampleSuggestions: boolean | undefined = undefined;
	const includeWordPressDotCom = undefined;

	// const locale = useLocale();
	const suggestedDomain = get( signupDependencies, 'suggestedDomain' );
	const path = '/start/link-in-bio/domains?new=test&search=yes&hide_initial_query=yes';

	// const search = true; //get( props, 'queryObject.search', false ) === 'yes';
	// // If we landed anew from `/domains` and it's the `new-flow` variation
	// // or there's a suggestedDomain from previous steps, always rerun the search.
	// if ( ( search && path.indexOf( '?' ) !== -1 ) || suggestedDomain ) {
	// 	setSearchOnInitialRender( true );
	// }

	const { submit } = navigation;

	const handleSkip = ( googleAppsCartItem = null, shouldHideFreePlan = false ) => {
		return;
		// const tracksProperties = Object.assign(
		// 	{
		// 		section: getAnalyticsSection(),
		// 		flow,
		// 		step: 'domains', //this.props.stepName,
		// 	},
		// 	isDependencyShouldHideFreePlanProvided() ? { should_hide_free_plan: shouldHideFreePlan } : {}
		// );

		// dispatch( recordTracksEvent( 'calypso_signup_skip_step', tracksProperties ) );

		// const stepData = {
		// 	stepName: 'domains', //this.props.stepName,
		// 	suggestion: undefined,
		// };

		// dispatch( saveSignupStep( stepData ) );

		// defer( () => {
		// 	submitWithDomain( null, googleAppsCartItem, shouldHideFreePlan );
		// } );
	};

	const getSubHeaderText = () => {
		if ( isAllDomains ) {
			return __( 'Find the domain that defines you' );
		}

		if ( isNewsletterOrLinkInBioFlow( flow ) ) {
			const components = {
				span: (
					// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
					<span
						role="button"
						className="tailored-flow-subtitle__cta-text"
						onClick={ () => handleSkip() }
					/>
				),
			};
			return flow === 'newsletter'
				? __(
						'Help your Newsletter stand out with a custom domain. Not sure yet? {{span}}Decide later{{/span}}.',
						{ components }
				  )
				: __(
						'Set your Link in Bio apart with a custom domain. Not sure yet? {{span}}Decide later{{/span}}.',
						{ components }
				  );
		}

		if ( isReskinned ) {
			return ! stepSectionName && __( 'Enter some descriptive keywords to get started' );
		}

		const subHeaderPropertyName = 'signUpFlowDomainsStepSubheader';
		const onboardingSubHeaderCopy =
			siteType &&
			flow === 'onboarding' &&
			getSiteTypePropertyValue( 'slug', siteType, subHeaderPropertyName );

		if ( onboardingSubHeaderCopy ) {
			return onboardingSubHeaderCopy;
		}

		return 'transfer' === stepSectionName || 'mapping' === stepSectionName
			? __( 'Use a domain you already own with your new WordPress.com site.' )
			: __( "Enter your site's name or some keywords that describe it to get started." );
	};

	const getHeaderText = () => {
		if ( stepSectionName === 'use-your-domain' ) {
			return '';
		}

		if ( isAllDomains ) {
			return __( 'Your next big idea starts here' );
		}

		if ( isReskinned ) {
			return ! stepSectionName && __( 'Choose a domain' );
		}

		const headerPropertyName = 'signUpFlowDomainsStepHeader';

		return getSiteTypePropertyValue( 'slug', siteType, headerPropertyName );
	};

	// function isTailoredFlow() {
	// 	return isNewsletterOrLinkInBioFlow( flow );
	// }

	function getAnalyticsSection() {
		return isDomainOnly ? 'domain-first' : 'signup';
	}

	const getDesignType = () => {
		if ( forceDesignType ) {
			return forceDesignType;
		}

		if ( signupDependencies && signupDependencies.designType ) {
			return signupDependencies.designType;
		}

		return designType;
	};

	const isPurchasingTheme = () => {
		return premium;
	};

	const getThemeSlug = () => {
		return theme;
	};

	const getThemeSlugWithRepo = ( themeSlug ) => {
		if ( ! themeSlug ) {
			return undefined;
		}
		const repo = isPurchasingTheme() ? 'premium' : 'pub';
		return `${ repo }/${ themeSlug }`;
	};

	const shouldUseThemeAnnotation = () => {
		return getThemeSlug() ? true : false;
	};

	const isDependencyShouldHideFreePlanProvided = () => {
		/**
		 * This prop is used to supress providing the dependency - shouldHideFreePlan - when the plans step is in the current flow
		 */
		return ! forceHideFreeDomainExplainerAndStrikeoutUi && isPlanSelectionAvailableLaterInFlow;
	};

	function shouldIncludeDotBlogSubdomain() {
		// 'subdomain' flow coming from .blog landing pages
		if ( flow === 'subdomain' ) {
			return true;
		}

		// newsletter users should get free .blog domain
		if ( flow === 'newsletter' ) {
			return true;
		}

		// 'blog' flow, starting with blog themes
		if ( flow === 'blog' ) {
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

		// const lastQuery = get( this.props.step, 'domainForm.lastQuery' );
		return typeof lastQuery === 'string' && lastQuery.includes( '.blog' );
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

	const getThemeArgs = () => {
		const themeSlug = getThemeSlug();
		const themeSlugWithRepo = getThemeSlugWithRepo( themeSlug );
		const theme = isPurchasingTheme() ? themeItem( themeSlug, 'signup-with-theme' ) : undefined;

		return { themeSlug, themeSlugWithRepo, themeItem: theme };
	};

	const submitWithDomain = ( suggestion, googleAppsCartItem, shouldHideFreePlan = false ) => {
		console.log( 'submitWithDomain', suggestion );
		const useThemeAnnotation = shouldUseThemeAnnotation();
		const useThemeHeadstartItem = useThemeAnnotation
			? { useThemeHeadstart: useThemeAnnotation }
			: {};

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

		if ( suggestion ) {
			dispatch( submitDomainStepSelection( suggestion, getAnalyticsSection() ) );
		}

		maybeExcludeEmailsStep( {
			domainItem,
			resetSignupStep: () => dispatch( removeStep ),
			siteUrl: suggestion?.domain_name,
			stepName: 'emails',
			submitSignupStep: () => dispatch( submitSignupStep ),
		} );

		dispatch(
			submitSignupStep(
				Object.assign(
					{
						stepName: 'domains', //this.props.stepName,
						domainItem,
						googleAppsCartItem,
						isPurchasingItem,
						siteUrl,
						stepSectionName,
						...( flow === 'newsletter' && siteAccentColor && { siteAccentColor } ),
					},
					getThemeArgs()
				),
				Object.assign(
					{ domainItem },
					isDependencyShouldHideFreePlanProvided() ? { shouldHideFreePlan } : {},
					useThemeHeadstartItem
				)
			)
		);

		// dispatch( setDesignType( getDesignType() ) );
		// // Start the username suggestion process.
		// siteUrl && dispatch( fetchUsernameSuggestion( siteUrl.split( '.' )[ 0 ] ) );

		// submit?.(); //this.props.goToNextStep();
	};

	// function getLocale() {
	// 	return ! userLoggedIn ? locale : '';
	// }

	// const getUseYourDomainUrl = () => {
	// 	return getStepUrl( flow, 'domains', 'use-your-domain', getLocale() );
	// };

	const handleSave = ( state ) => {
		dispatch(
			saveSignupStep( {
				stepName: 'domains', //this.props.stepName,
				stepSectionName,
				domainForm: state,
			} )
		);
	};

	// const shouldHideDomainExplainer = () => {
	// 	return [
	// 		'free',
	// 		'personal',
	// 		'personal-monthly',
	// 		'premium',
	// 		'premium-monthly',
	// 		'business',
	// 		'business-monthly',
	// 		'ecommerce',
	// 		'ecommerce-monthly',
	// 		'domain',
	// 	].includes( flow as string );
	// };

	// const handleAddMapping = ( sectionName, domain, state ) => {
	// 	const domainItem = domainMapping( { domain } );
	// 	const isPurchasingItem = true;
	// 	const useThemeAnnotation = shouldUseThemeAnnotation();
	// 	const useThemeHeadstartItem = useThemeAnnotation
	// 		? { useThemeHeadstart: useThemeAnnotation }
	// 		: {};

	// 	dispatch( recordAddDomainButtonClickInMapDomain( domain, getAnalyticsSection() ) );

	// 	dispatch(
	// 		submitSignupStep(
	// 			Object.assign(
	// 				{
	// 					stepName: 'domains', //this.props.stepName,
	// 					[ sectionName ]: state,
	// 					domainItem,
	// 					isPurchasingItem,
	// 					siteUrl: domain,
	// 					stepSectionName: this.props.stepSectionName,
	// 				},
	// 				getThemeArgs()
	// 			),
	// 			Object.assign( { domainItem }, useThemeHeadstartItem )
	// 		)
	// 	);

	// 	submit?.(); //this.props.goToNextStep();
	// };

	const handleAddDomain = ( suggestion ) => {
		const stepData = {
			stepName: 'domains',
			suggestion,
		};

		dispatch(
			recordAddDomainButtonClick(
				suggestion.domain_name,
				getAnalyticsSection(),
				suggestion?.is_premium
			)
		);

		dispatch( saveSignupStep( stepData ) );

		defer( () => {
			submitWithDomain( suggestion, null, null );
		} );
	};

	// const handleDomainExplainerClick = () => {
	// 	const hideFreePlan = true;
	// 	handleSkip( undefined, hideFreePlan );
	// };

	// const handleUseYourDomainClick = () => {
	// 	dispatch( recordUseYourDomainButtonClick( getAnalyticsSection() ) );
	// 	page( getUseYourDomainUrl() );
	// };

	// const shouldHideUseYourDomain = () => {
	// 	return [ 'domain' ].includes( flow as string );
	// };

	// const shouldDisplayDomainOnlyExplainer = () => {
	// 	return [ 'domain' ].includes( flow as string );
	// };

	// const getSideContent = () => {
	// 	const useYourDomain = ! shouldHideUseYourDomain() ? (
	// 		<div className="domains__domain-side-content">
	// 			<ReskinSideExplainer onClick={ handleUseYourDomainClick } type={ 'use-your-domain' } />
	// 		</div>
	// 	) : null;

	// 	return (
	// 		<div className="domains__domain-side-content-container">
	// 			{ ! shouldHideDomainExplainer() && isPlanSelectionAvailableLaterInFlow && (
	// 				<div className="domains__domain-side-content domains__free-domain">
	// 					<ReskinSideExplainer
	// 						onClick={ handleDomainExplainerClick }
	// 						type={ 'free-domain-explainer' }
	// 						flowName={ flow }
	// 					/>
	// 				</div>
	// 			) }
	// 			{ useYourDomain }
	// 			{ shouldDisplayDomainOnlyExplainer() && (
	// 				<div className="domains__domain-side-content">
	// 					<ReskinSideExplainer
	// 						onClick={ handleDomainExplainerClick }
	// 						type={ 'free-domain-only-explainer' }
	// 					/>
	// 				</div>
	// 			) }
	// 		</div>
	// 	);
	// };

	const domainForm = () => {
		const initialState: Search = {};
		// if ( this.props.step ) {
		// 	initialState = this.props.step.domainForm;
		// }

		// If it's the first load, rerun the search with whatever we get from the query param or signup dependencies.
		const initialQuery = siteTitle || suggestedDomain;

		// Search using the initial query but do not show the query on the search input field.
		//const hideInitialQuery = get( this.props, 'queryObject.hide_initial_query', false ) === 'yes';

		if (
			// If we landed here from /domains Search or with a suggested domain.
			initialQuery &&
			searchOnInitialRender
		) {
			setSearchOnInitialRender( false );
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

		// let showExampleSuggestions = this.props.showExampleSuggestions;
		if ( 'undefined' === typeof showExampleSuggestions ) {
			showExampleSuggestions = true;
		}

		const shouldIncludeWordPressDotCom = includeWordPressDotCom ?? ! isDomainOnly;

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					analyticsSection={ getAnalyticsSection() }
					basePath={ path }
					deemphasiseTlds={ flow === 'ecommerce' ? [ 'blog' ] : [] }
					designType={ getDesignType() }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					forceHideFreeDomainExplainerAndStrikeoutUi={ forceHideFreeDomainExplainerAndStrikeoutUi }
					includeDotBlogSubdomain={ shouldIncludeDotBlogSubdomain() }
					includeWordPressDotCom={ shouldIncludeWordPressDotCom }
					initialState={ initialState }
					isDomainOnly={ isDomainOnly }
					isPlanSelectionAvailableInFlow={ isPlanSelectionAvailableLaterInFlow }
					isReskinned={ isReskinned }
					isSignupStep
					key="domainForm"
					offerUnavailableOption={ ! isDomainOnly }
					onAddDomain={ handleAddDomain }
					// onAddMapping={ handleAddMapping }
					onSave={ handleSave }
					path={ path }
					products={ productsList }
					promoTlds={ [] }
					showExampleSuggestions={ showExampleSuggestions }
					showSkipButton={ showSkipButton }
					suggestion={ initialQuery }
					vendor={ getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: isDomainOnly,
						flowName: flow,
					} ) }
				/>
			</CalypsoShoppingCartProvider>
		);
		// return (
		// 	<CalypsoShoppingCartProvider>
		// 		<RegisterDomainStep
		// 			mapDomainUrl={ getUseYourDomainUrl() }
		// 			transferDomainUrl={ getUseYourDomainUrl() }
		// 			useYourDomainUrl={ getUseYourDomainUrl() }
		// 			selectedSite={ selectedSite }
		// 			onSkip={ handleSkip }
		// 			hideFreePlan={ handleSkip }
		// 			reskinSideContent={ getSideContent() }
		// 		/>
		// 	</CalypsoShoppingCartProvider>
		// );
	};

	const renderContent = () => {
		let content;
		// let sideContent;

		// if ( 'use-your-domain' === stepSectionName ) {
		// 	content = this.useYourDomainForm();
		// }

		if ( ! stepSectionName || isDomainOnly ) {
			content = domainForm();
		}

		// if ( ! stepSectionName && isReskinned && ! isTailoredFlow() ) {
		// 	sideContent = getSideContent();
		// }

		return (
			<div className="domains__step-content domains__step-content-domain-step">
				{ content }
				{ /* { sideContent } */ }
			</div>
		);
	};

	return (
		<StepContainer
			stepName={ 'domains' }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'linkInBio' }
			stepContent={
				<div className="domains__content">
					{ isEmpty( productsList ) && <QueryProductsList /> }
					{ renderContent() }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
			goNext={ () => submit?.() }
			formattedHeader={
				<FormattedHeader
					id={ 'domains-header' }
					align={ 'left' }
					headerText={ getHeaderText() }
					subHeaderText={ getSubHeaderText() }
				/>
			}
		/>
	);
};

export default DomainsStep;
