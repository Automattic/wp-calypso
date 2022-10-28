/* eslint-disable wpcalypso/jsx-classname-namespace */

import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import UseMyDomain from 'calypso/components/domains/use-my-domain';
import FormattedHeader from 'calypso/components/formatted-header';
import {
	domainRegistration,
	domainMapping,
	domainTransfer,
} from 'calypso/lib/cart-values/cart-items';
import { getDomainSuggestionSearch, getFixedDomainSearch } from 'calypso/lib/domains';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
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
import type { DomainSuggestion, DomainForm } from '@automattic/data-stores';
import './style.scss';

const DomainsStep: Step = function DomainsStep( { navigation, flow } ) {
	const { productsList, selectedSite } = useSelector( ( state ) => {
		return {
			productsList: getAvailableProductsList( state ),
			userLoggedIn: isUserLoggedIn( state ),
			selectedSite: getSelectedSite( state ),
		};
	} );

	const { domainForm, siteTitle } = useSelect( ( select ) => {
		return {
			domainForm: select( ONBOARD_STORE ).getDomainForm(),
			siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
		};
	} );

	const { setDomainForm, setHideFreePlan, setDomainCartItem } = useDispatch( ONBOARD_STORE );

	const { __ } = useI18n();

	const [ searchOnInitialRender, setSearchOnInitialRender ] = useState( true );
	const [ showUseYourDomain, setShowUseYourDomain ] = useState( false );

	const dispatch = useReduxDispatch();

	const { submit } = navigation;
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

	const domainsWithPlansOnly = true;
	const isPlanSelectionAvailableLaterInFlow = true;

	const submitDomainStepSelection = ( suggestion: DomainSuggestion, section: string ) => {
		let domainType = 'domain_reg';
		if ( suggestion.is_free ) {
			domainType = 'wpcom_subdomain';
			if ( suggestion.domain_name.endsWith( '.blog' ) ) {
				domainType = 'dotblog_subdomain';
			}
		}

		const tracksObjects: {
			label?: string;
			domain_name: string;
			type: string;
			section: string;
		} = {
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

	const submitWithDomain = (
		suggestion: DomainSuggestion | undefined,
		shouldHideFreePlan = false
	) => {
		if ( suggestion ) {
			const domainCartItem = domainRegistration( {
				domain: suggestion.domain_name,
				productSlug: suggestion.product_slug,
			} );
			dispatch( submitDomainStepSelection( suggestion, getAnalyticsSection() ) );

			setHideFreePlan( Boolean( suggestion.product_slug ) || shouldHideFreePlan );
			setDomainCartItem( domainCartItem );
		}

		submit?.();
	};

	const handleSkip = ( _googleAppsCartItem = undefined, shouldHideFreePlan = false ) => {
		const tracksProperties = Object.assign(
			{
				section: getAnalyticsSection(),
				flow,
				step: 'domains',
			},
			{}
		);

		dispatch( recordTracksEvent( 'calypso_signup_skip_step', tracksProperties ) );

		submitWithDomain( undefined, shouldHideFreePlan );
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
		return 'signup';
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

		return typeof lastQuery === 'string' && lastQuery.includes( '.blog' );
	}

	const getUseYourDomainUrl = () => {
		//This will return as /start/link-in-bio/domains/use-your-domain. Commented out because
		//it always throws window.AppBoot is not a function
		return '/setup/domains?flow=link-in-bio&section=use-your-domain';
	};

	const handleAddTransfer = ( { domain, authCode }: { domain: string; authCode: string } ) => {
		const domainCartItem = domainTransfer( {
			domain,
			extra: {
				auth_code: authCode,
				signup: true,
			},
		} );

		dispatch( recordAddDomainButtonClickInTransferDomain( domain, getAnalyticsSection() ) );

		setDomainCartItem( domainCartItem );

		submit?.();
	};

	const handleAddMapping = ( domain: string ) => {
		const domainCartItem = domainMapping( { domain } );

		dispatch( recordAddDomainButtonClickInMapDomain( domain, getAnalyticsSection() ) );

		setDomainCartItem( domainCartItem );

		submit?.();
	};

	const handleAddDomain = ( suggestion: DomainSuggestion ) => {
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
						onConnect={ ( { domain } ) => handleAddMapping( domain ) }
					/>
				</CalypsoShoppingCartProvider>
			</div>
		);
	};

	const shouldHideUseYourDomain = () => {
		return [ 'domain' ].includes( flow as string );
	};

	const shouldDisplayDomainOnlyExplainer = () => {
		return [ 'domain' ].includes( flow as string );
	};

	const shouldHideDomainExplainer = () => {
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
		].includes( flow as string );
	};

	const handleDomainExplainerClick = () => {
		const hideFreePlan = true;
		handleSkip( undefined, hideFreePlan );
	};

	const handleUseYourDomainClick = () => {
		recordUseYourDomainButtonClick( getAnalyticsSection() );
		page( getUseYourDomainUrl() );
	};

	const getSideContent = () => {
		const useYourDomain = ! shouldHideUseYourDomain() ? (
			<div className="domains__domain-side-content">
				<ReskinSideExplainer onClick={ handleUseYourDomainClick } type="use-your-domain" />
			</div>
		) : null;

		return (
			<div className="domains__domain-side-content-container">
				{ ! shouldHideDomainExplainer() && isPlanSelectionAvailableLaterInFlow && (
					<div className="domains__domain-side-content domains__free-domain">
						<ReskinSideExplainer
							onClick={ handleDomainExplainerClick }
							type="free-domain-explainer"
							flowName={ flow }
						/>
					</div>
				) }
				{ useYourDomain }
				{ shouldDisplayDomainOnlyExplainer() && (
					<div className="domains__domain-side-content">
						<ReskinSideExplainer
							onClick={ handleDomainExplainerClick }
							type="free-domain-only-explainer"
						/>
					</div>
				) }
			</div>
		);
	};

	const renderDomainForm = () => {
		let initialState: DomainForm = {};
		if ( domainForm ) {
			initialState = domainForm;
		}
		const initialQuery = siteTitle;

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
				initialState.hideInitialQuery = true;
			}
		}

		if ( 'undefined' === typeof showExampleSuggestions ) {
			showExampleSuggestions = true;
		}

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					analyticsSection={ getAnalyticsSection() }
					basePath={ path }
					deemphasiseTlds={ flow === 'ecommerce' ? [ 'blog' ] : [] }
					designType={ undefined }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					includeDotBlogSubdomain={ shouldIncludeDotBlogSubdomain() }
					includeWordPressDotCom={ includeWordPressDotCom ?? true }
					initialState={ initialState }
					isPlanSelectionAvailableInFlow={ isPlanSelectionAvailableLaterInFlow }
					isReskinned={ true }
					reskinSideContent={ getSideContent() }
					isSignupStep
					key="domainForm"
					mapDomainUrl={ getUseYourDomainUrl() }
					offerUnavailableOption
					onAddDomain={ handleAddDomain }
					onAddMapping={ handleAddMapping }
					onSave={ setDomainForm }
					onSkip={ handleSkip }
					path={ path }
					products={ productsList }
					selectedSite={ selectedSite }
					showExampleSuggestions={ showExampleSuggestions }
					showSkipButton={ showSkipButton }
					suggestion={ initialQuery }
					transferDomainUrl={ getUseYourDomainUrl() }
					handleClickUseYourDomain={ () => setShowUseYourDomain( true ) }
					vendor={ getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: false,
						flowName: flow || undefined,
					} ) }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	const renderContent = () => {
		let content;

		if ( showUseYourDomain ) {
			content = renderYourDomainForm();
		} else {
			content = renderDomainForm();
		}

		return (
			<div className="domains__step-content domains__step-content-domain-step">{ content }</div>
		);
	};

	return (
		<StepContainer
			stepName="domains"
			isWideLayout={ true }
			hideBack={ true }
			hideSkip={ true }
			flowName="linkInBio"
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
					id="domains-header"
					align="left"
					headerText={ getHeaderText() }
					subHeaderText={ getSubHeaderText() }
				/>
			}
		/>
	);
};

export default DomainsStep;
