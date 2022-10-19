/* eslint-disable wpcalypso/jsx-classname-namespace */

import { useLocale } from '@automattic/i18n-utils';
import { StepContainer, createSiteWithCart } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import UseMyDomain from 'calypso/components/domains/use-my-domain';
import FormattedHeader from 'calypso/components/formatted-header';
import { NEWSLETTER_FLOW } from 'calypso/../packages/onboarding/src';
import Notice from 'calypso/components/notice';
import {
	domainRegistration,
	themeItem,
	domainMapping,
	domainTransfer,
} from 'calypso/lib/cart-values/cart-items';
import { getDomainSuggestionSearch, getFixedDomainSearch } from 'calypso/lib/domains';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import {
	retrieveSignupDestination,
	getSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
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
} from 'calypso/state/domains/actions';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { ONBOARD_STORE } from '../../../../stores';
import type { Step } from '../../types';
import './style.scss';
import domainOnly from 'calypso/my-sites/domains/domain-management/list/domain-only';

const DomainsStep: Step = function DomainsStep( { navigation, flow, data } ) {
	const { productsList, userLoggedIn, selectedSite } = useSelector( ( state ) => {
		return {
			productsList: getAvailableProductsList( state ),
			userLoggedIn: isUserLoggedIn( state ),
			selectedSite: getSelectedSite( state ),
		};
	} );

	const { siteAccentColor, domainForm, signupValues } = useSelect( ( select ) => {
		return {
			siteAccentColor: select( ONBOARD_STORE ).getSelectedSiteAccentColor(),
			domainForm: select( ONBOARD_STORE ).getDomainForm(),
			signupValues: select( ONBOARD_STORE ).getSignupValues(),
		};
	} );

	const { setDomainForm, setSignupValues, setMultiplePendingAction } = useDispatch( ONBOARD_STORE );

	const { __ } = useI18n();
	const search = data?.search ?? false;
	const suggestedDomain = signupValues?.suggestedDomain;
	const domain = data?.new;

	const [ searchOnInitialRender, setSearchOnInitialRender ] = useState( search || suggestedDomain );
	const [ showUseYourDomain, setShowUseYourDomain ] = useState( false );

	const dispatch = useReduxDispatch();

	const { submit } = navigation;
	const hideInitialQuery = data?.hideInitialQuery ?? false;
	const siteType = signupValues?.siteType ?? '';
	const path = '/start/link-in-bio/domains?new=test';
	const lastQuery = domainForm?.lastQuery;
	let showExampleSuggestions: boolean | undefined = undefined;
	let includeWordPressDotCom: boolean | undefined = undefined;
	let showSkipButton: boolean | undefined = undefined;

	// Checks if the user entered the signup flow via browser back from checkout page,
	// and if they did, we'll show a modified domain step to prevent creating duplicate sites,
	// check pau2Xa-1Io-p2#comment-6759.
	const searchParams = new URLSearchParams( window.location.search );
	const isAddNewSiteFlow = searchParams.has( 'ref' );
	const signupDestinationCookieExists = retrieveSignupDestination();
	const isReEnteringFlow = getSignupCompleteFlowName() === flow;
	const isReEnteringSignupViaBrowserBack =
		wasSignupCheckoutPageUnloaded() && signupDestinationCookieExists && isReEnteringFlow;

	const isManageSiteFlow = ! isAddNewSiteFlow && isReEnteringSignupViaBrowserBack;

	if ( isManageSiteFlow ) {
		showExampleSuggestions = false;
		includeWordPressDotCom = false;
		showSkipButton = true;
	}

	const isDomainOnly = signupValues?.isDomainOnly ?? false;

	const forceHideFreeDomainExplainerAndStrikeoutUi = undefined;
	const premium = undefined;
	const domainsWithPlansOnly = true;
	const theme = undefined;
	const isPlanSelectionAvailableLaterInFlow = true;
	const promoTlds = data?.tld?.split( ',' );

	const locale = useLocale();

	const isDependencyShouldHideFreePlanProvided = () => {
		/**
		 * This prop is used to supress providing the dependency - shouldHideFreePlan - when the plans step is in the current flow
		 */
		return ! forceHideFreeDomainExplainerAndStrikeoutUi && isPlanSelectionAvailableLaterInFlow;
	};

	const getThemeSlug = () => {
		return theme;
	};

	const isPurchasingTheme = () => {
		return premium;
	};

	const getThemeSlugWithRepo = ( themeSlug ) => {
		if ( ! themeSlug ) {
			return undefined;
		}
		const repo = isPurchasingTheme() ? 'premium' : 'pub';
		return `${ repo }/${ themeSlug }`;
	};

	const getThemeArgs = () => {
		const themeSlug = getThemeSlug();
		const themeSlugWithRepo = getThemeSlugWithRepo( themeSlug );
		const theme = isPurchasingTheme() ? themeItem( themeSlug, 'signup-with-theme' ) : undefined;

		return { themeSlug, themeSlugWithRepo, themeItem: theme };
	};

	const shouldUseThemeAnnotation = () => {
		return getThemeSlug() ? true : false;
	};

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

	const submitWithDomain = ( suggestion, googleAppsCartItem?: any, shouldHideFreePlan = false ) => {
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

		setSignupValues( { domainItem, shouldHideFreePlan } );

		if ( suggestion ) {
			dispatch( submitDomainStepSelection( suggestion, getAnalyticsSection() ) );
		}

		setMultiplePendingAction( async () => {
			const createSiteResult = await createSiteWithCart(
				flow,
				siteUrl,
				isManageSiteFlow,
				{
					domainItem,
					flowName: flow,
					lastKnownFlow: flow,
					googleAppsCartItem,
					isPurchasingItem,
					siteUrl,
					themeItem: undefined,
					siteTitle: domain,
					siteAccentColor,
					themeSlugWithRepo: flow === NEWSLETTER_FLOW ? 'pub/lettre' : 'pub/lynx',
					comingSoon: flow === NEWSLETTER_FLOW ? 0 : 1,
				},
				userLoggedIn,
				false
			);

			setSignupValues( { createdSiteSlug: createSiteResult?.siteSlug } );

			return createSiteResult;
		}, 'domains' );

		submit?.();
	};

	const handleSkip = ( googleAppsCartItem = undefined, shouldHideFreePlan = false ) => {
		const tracksProperties = Object.assign(
			{
				section: getAnalyticsSection(),
				flow,
				step: 'domains',
			},
			isDependencyShouldHideFreePlanProvided() ? { should_hide_free_plan: shouldHideFreePlan } : {}
		);

		dispatch( recordTracksEvent( 'calypso_signup_skip_step', tracksProperties ) );

		submitWithDomain( undefined, googleAppsCartItem, shouldHideFreePlan );
	};

	const getSubHeaderText = () => {
		const decideLaterComponent = {
			decide_later: (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
				<span
					role="button"
					className="tailored-flow-subtitle__cta-text"
					onClick={ () => handleSkip() }
				/>
			),
		};
		return flow === 'newsletter'
			? createInterpolateElement(
					__(
						'Help your Newsletter stand out with a custom domain. Not sure yet? <decide_later>Decide later</decide_later>.'
					),
					decideLaterComponent
			  )
			: createInterpolateElement(
					__(
						'Set your Link in Bio apart with a custom domain. Not sure yet? <decide_later>Decide later</decide_later>.'
					),
					decideLaterComponent
			  );
	};

	const getHeaderText = () => {
		if ( showUseYourDomain ) {
			return '';
		}

		return __( 'Choose a domain' );
	};

	function getAnalyticsSection() {
		return isDomainOnly ? 'domain-first' : 'signup';
	}

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
			'blog' === siteType
		) {
			return true;
		}

		return typeof lastQuery === 'string' && lastQuery.includes( '.blog' );
	}

	function getLocale() {
		return ! userLoggedIn ? locale : '';
	}

	const getUseYourDomainUrl = () => {
		//This will return as /start/link-in-bio/domains/use-your-domain. Commented out because
		//it always throws window.AppBoot is not a function
		return '/setup/domains?flow=link-in-bio&section=use-your-domain';
	};

	const handleSave = ( state ) => {
		setDomainForm( state );
	};

	const handleAddTransfer = ( { domain, authCode } ) => {
		const domainItem = domainTransfer( {
			domain,
			extra: {
				auth_code: authCode,
				signup: true,
			},
		} );
		const isPurchasingItem = true;
		const useThemeAnnotation = shouldUseThemeAnnotation();
		const useThemeHeadstartItem = useThemeAnnotation
			? { useThemeHeadstart: useThemeAnnotation }
			: {};

		dispatch( recordAddDomainButtonClickInTransferDomain( domain, getAnalyticsSection() ) );

		setSignupValues(
			Object.assign(
				{ domainItem, siteUrl: domain, transfer: {} },
				getThemeArgs(),
				useThemeHeadstartItem
			)
		);

		setMultiplePendingAction( async () => {
			const createSiteResult = await createSiteWithCart(
				flow,
				domain,
				isManageSiteFlow,
				{
					domainItem,
					flowName: undefined,
					lastKnownFlow: flow,
					isPurchasingItem,
					domain,
					themeSlugWithRepo: flow === NEWSLETTER_FLOW ? 'pub/lettre' : 'pub/lynx',
					comingSoon: flow === NEWSLETTER_FLOW ? 0 : 1,
					themeItem: undefined,
					siteTitle: domain,
				},
				userLoggedIn,
				false
			);

			setSignupValues( { createdSiteSlug: createSiteResult?.siteSlug } );

			return createSiteResult;
		}, 'domains' );

		submit?.();
	};

	const handleAddMapping = ( domain, state ) => {
		const domainItem = domainMapping( { domain } );
		const isPurchasingItem = true;
		const useThemeAnnotation = shouldUseThemeAnnotation();
		const useThemeHeadstartItem = useThemeAnnotation
			? { useThemeHeadstart: useThemeAnnotation }
			: {};

		dispatch( recordAddDomainButtonClickInMapDomain( domain, getAnalyticsSection() ) );

		setSignupValues(
			Object.assign( { domainItem, siteUrl: domain }, getThemeArgs(), useThemeHeadstartItem )
		);

		setMultiplePendingAction( async () => {
			const createSiteResult = await createSiteWithCart(
				flow,
				domain,
				isManageSiteFlow,
				{
					domainItem,
					flowName: undefined,
					lastKnownFlow: flow,
					isPurchasingItem,
					domain,
					themeItem: undefined,
					siteTitle: domain,
					useThemeHeadstart: useThemeAnnotation,
					themeSlugWithRepo: flow === NEWSLETTER_FLOW ? 'pub/lettre' : 'pub/lynx',
					comingSoon: flow === NEWSLETTER_FLOW ? 0 : 1,
				},
				userLoggedIn,
				false
			);

			setSignupValues( { createdSiteSlug: createSiteResult?.siteSlug } );

			return createSiteResult;
		}, 'domains' );

		submit?.();
	};

	const onUseMyDomainConnect = ( { domain } ) => {
		handleAddMapping( domain, null );
	};

	const handleAddDomain = ( suggestion ) => {
		dispatch(
			recordAddDomainButtonClick(
				suggestion.domain_name,
				getAnalyticsSection(),
				suggestion?.is_premium
			)
		);

		submitWithDomain( suggestion );
	};

	const renderYourDomainForm = () => {
		return (
			<div className="domains__step-section-wrapper" key="useYourDomainForm">
				<CalypsoShoppingCartProvider>
					<UseMyDomain
						analyticsSection={ getAnalyticsSection() }
						basePath={ path }
						initialQuery={ lastQuery }
						initialMode={ inputMode.domainInput }
						onNextStep={ null }
						isSignupStep
						showHeader={ false }
						onTransfer={ handleAddTransfer }
						onConnect={ onUseMyDomainConnect }
					/>
				</CalypsoShoppingCartProvider>
			</div>
		);
	};

	const renderDomainForm = () => {
		let initialState = {};
		if ( domainForm ) {
			initialState = domainForm;
		}
		const initialQuery = domain || suggestedDomain;

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
					designType={ undefined }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					forceHideFreeDomainExplainerAndStrikeoutUi={ forceHideFreeDomainExplainerAndStrikeoutUi }
					includeDotBlogSubdomain={ shouldIncludeDotBlogSubdomain() }
					includeWordPressDotCom={ shouldIncludeWordPressDotCom }
					initialState={ initialState }
					isDomainOnly={ isDomainOnly }
					isPlanSelectionAvailableInFlow={ isPlanSelectionAvailableLaterInFlow }
					isReskinned={ true }
					isSignupStep
					key="domainForm"
					mapDomainUrl={ getUseYourDomainUrl() }
					offerUnavailableOption={ ! isDomainOnly }
					onAddDomain={ handleAddDomain }
					onAddMapping={ handleAddMapping }
					onSave={ handleSave }
					onSkip={ handleSkip }
					path={ path }
					products={ productsList }
					promoTlds={ promoTlds }
					selectedSite={ selectedSite }
					showExampleSuggestions={ showExampleSuggestions }
					showSkipButton={ showSkipButton }
					suggestion={ initialQuery }
					transferDomainUrl={ getUseYourDomainUrl() }
					handleClickUseYourDomain={ () => setShowUseYourDomain( true ) }
					vendor={ getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: isDomainOnly,
						flowName: flow,
					} ) }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	const renderContent = () => {
		let content;

		if ( showUseYourDomain ) {
			content = renderYourDomainForm();
		} else if ( ! showUseYourDomain || isDomainOnly ) {
			content = renderDomainForm();
		}

		// if ( 'invalid' === this.props.step.status ) {
		// 	content = (
		// 		<div className="domains__step-section-wrapper">
		// 			<Notice status="is-error" showDismiss={ false }>
		// 				{ this.props.step.errors.message }
		// 			</Notice>
		// 			{ content }
		// 		</div>
		// 	);
		// }

		return (
			<div className="domains__step-content domains__step-content-domain-step">{ content }</div>
		);
	};

	return (
		<StepContainer
			stepName={ 'domains' }
			isWideLayout={ true }
			hideBack={ true }
			hideSkip={ true }
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
