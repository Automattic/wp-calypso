import { LINK_IN_BIO_TLD_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import UseMyDomain from 'calypso/components/domains/use-my-domain';
import { getDomainSuggestionSearch, getFixedDomainSearch } from 'calypso/lib/domains';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import {
	retrieveSignupDestination,
	getSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useQuery } from '../../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../../stores';
import type { DomainSuggestion, DomainForm } from '@automattic/data-stores';

interface DomainFormControlProps {
	analyticsSection: string;
	flow: string | null;
	onAddDomain: ( suggestion: DomainSuggestion ) => void;
	onAddMapping: ( domain: string ) => void;
	onAddTransfer: ( { domain, authCode }: { domain: string; authCode: string } ) => void;
	onSkip: ( _googleAppsCartItem?: any, shouldHideFreePlan?: boolean ) => void;
	onUseYourDomainClick: () => void;
	showUseYourDomain: boolean;
}

export function DomainFormControl( {
	analyticsSection,
	flow,
	onAddDomain,
	onAddMapping,
	onAddTransfer,
	onSkip,
	onUseYourDomainClick,
	showUseYourDomain,
}: DomainFormControlProps ) {
	const { selectedSite, productsList } = useSelector( ( state ) => {
		return {
			selectedSite: getSelectedSite( state ),
			productsList: getAvailableProductsList( state ),
		};
	} );

	const { domainForm, siteTitle } = useSelect( ( select ) => ( {
		domainForm: select( ONBOARD_STORE ).getDomainForm(),
		siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
	} ) );

	const { setDomainForm } = useDispatch( ONBOARD_STORE );

	const [ searchOnInitialRender, setSearchOnInitialRender ] = useState( true );

	const path = '/start/link-in-bio/domains?new=test';
	let showExampleSuggestions: boolean | undefined = undefined;
	let includeWordPressDotCom: boolean | undefined = undefined;
	let showSkipButton: boolean | undefined = undefined;

	// Checks if the user entered the signup flow via browser back from checkout page,
	// and if they did, we'll show a modified domain step to prevent creating duplicate sites,
	// check pau2Xa-1Io-p2#comment-6759.
	const isAddNewSiteFlow = useQuery().has( 'ref' );
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

	if ( flow === LINK_IN_BIO_TLD_FLOW ) {
		includeWordPressDotCom = false;
	}

	const domainsWithPlansOnly = true;
	const isPlanSelectionAvailableLaterInFlow = true;
	const domainSearchInQuery = useQuery().get( 'new' ); // following the convention of /start/domains

	const handleUseYourDomainClick = () => {
		recordUseYourDomainButtonClick( analyticsSection );
		onUseYourDomainClick();
	};

	const handleDomainExplainerClick = () => {
		const hideFreePlan = true;
		onSkip( undefined, hideFreePlan );
	};

	const getSideContent = () => {
		const useYourDomain = (
			<div className="domains__domain-side-content">
				<ReskinSideExplainer onClick={ handleUseYourDomainClick } type="use-your-domain" />
			</div>
		);

		return (
			<div className="domains__domain-side-content-container">
				<div className="domains__domain-side-content domains__free-domain">
					<ReskinSideExplainer
						onClick={ handleDomainExplainerClick }
						type="free-domain-explainer"
						flowName={ flow }
					/>
				</div>
				{ useYourDomain }
			</div>
		);
	};

	const getUseYourDomainUrl = () => {
		//This will return as /start/link-in-bio/domains/use-your-domain. Commented out because
		//it always throws window.AppBoot is not a function
		return '/setup/domains?flow=link-in-bio&section=use-your-domain';
	};

	const getOtherManagedSubdomains = () => {
		if ( flow === LINK_IN_BIO_TLD_FLOW ) {
			return [ 'link' ];
		}
	};

	const getOtherManagedSubdomainsCountOverride = () => {
		if ( flow === LINK_IN_BIO_TLD_FLOW ) {
			return 2;
		}
	};

	const getPromoTlds = () => {
		if ( flow === LINK_IN_BIO_TLD_FLOW ) {
			return [ 'link' ];
		}
	};

	const shouldIncludeDotBlogSubdomain = () => {
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

		return typeof domainForm?.lastQuery === 'string' && domainForm?.lastQuery.includes( '.blog' );
	};

	const renderYourDomainForm = () => {
		return (
			<div className="domains__step-section-wrapper" key="useYourDomainForm">
				<CalypsoShoppingCartProvider>
					<UseMyDomain
						analyticsSection={ analyticsSection }
						basePath={ path }
						initialQuery={ domainForm?.lastQuery }
						initialMode={ inputMode.domainInput }
						onNextStep={ null }
						isSignupStep
						showHeader={ false }
						onTransfer={ onAddTransfer }
						onConnect={ ( { domain } ) => onAddMapping( domain ) }
					/>
				</CalypsoShoppingCartProvider>
			</div>
		);
	};

	const renderDomainForm = () => {
		let initialState: DomainForm = {};
		if ( domainForm ) {
			initialState = domainForm;
		}
		const initialQuery = domainSearchInQuery || siteTitle;

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
				// when it's provided via the query arg, follow the convention of /start/domains to show it
				initialState.hideInitialQuery = ! domainSearchInQuery;
			}
		}

		if ( 'undefined' === typeof showExampleSuggestions ) {
			showExampleSuggestions = true;
		}

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					analyticsSection={ analyticsSection }
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
					otherManagedSubdomains={ getOtherManagedSubdomains() }
					otherManagedSubdomainsCountOverride={ getOtherManagedSubdomainsCountOverride() }
					onAddDomain={ onAddDomain }
					onAddMapping={ onAddMapping }
					onSave={ setDomainForm }
					onSkip={ onSkip }
					path={ path }
					products={ productsList }
					promoTlds={ getPromoTlds() }
					selectedSite={ selectedSite }
					showExampleSuggestions={ showExampleSuggestions }
					showSkipButton={ showSkipButton }
					suggestion={ initialQuery }
					transferDomainUrl={ getUseYourDomainUrl() }
					handleClickUseYourDomain={ onUseYourDomainClick }
					vendor={ getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: false,
						flowName: flow || undefined,
					} ) }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	let content;
	if ( showUseYourDomain ) {
		content = renderYourDomainForm();
	} else {
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
		<>
			{ isEmpty( productsList ) && <QueryProductsList /> }
			<div className="domains__step-content domains__step-content-domain-step">{ content }</div>
		</>
	);
}
