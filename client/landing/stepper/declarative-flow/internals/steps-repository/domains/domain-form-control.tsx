import {
	COPY_SITE_FLOW,
	DOMAIN_UPSELL_FLOW,
	HUNDRED_YEAR_DOMAIN_FLOW,
	HUNDRED_YEAR_PLAN_FLOW,
	isDomainUpsellFlow,
	NEWSLETTER_FLOW,
	READYMADE_TEMPLATE_FLOW,
	REBLOGGING_FLOW,
	START_WRITING_FLOW,
} from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import QueryProductsList from 'calypso/components/data/query-products-list';
import RegisterDomainStepV2 from 'calypso/components/domain-search-v2/register-domain-step';
import { useMyDomainInputMode as inputMode } from 'calypso/components/domains/connect-domain-step/constants';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import SideExplainer from 'calypso/components/domains/side-explainer';
import UseMyDomain from 'calypso/components/domains/use-my-domain';
import { getDomainSuggestionSearch, getFixedDomainSearch } from 'calypso/lib/domains';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { useIsDomainSearchV2Enabled } from 'calypso/lib/domains/use-domain-search-v2';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import {
	retrieveSignupDestination,
	getSignupCompleteFlowName,
	wasSignupCheckoutPageUnloaded,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useQuery } from '../../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../../stores';
import type { DomainSuggestion } from '@automattic/api-core';
import type { DomainForm, OnboardSelect } from '@automattic/data-stores';

interface DomainFormControlProps {
	onContinue: () => void;
	analyticsSection: string;
	flow: string;
	onAddDomain: ( suggestion: DomainSuggestion, position: number ) => void;
	onAddMapping: ( domain: string ) => void;
	onAddTransfer: ( { domain, authCode }: { domain: string; authCode: string } ) => void;
	onSkip: ( _googleAppsCartItem?: any, shouldHideFreePlan?: boolean ) => void;
	onUseYourDomainClick: ( domain?: string ) => void;
	showUseYourDomain: boolean;
	isCartPendingUpdate: boolean;
	isCartPendingUpdateDomain: DomainSuggestion | undefined;
}

export function DomainFormControl( {
	onContinue,
	analyticsSection,
	flow,
	onAddDomain,
	onAddMapping,
	onAddTransfer,
	onSkip,
	onUseYourDomainClick,
	showUseYourDomain,
	isCartPendingUpdate,
	isCartPendingUpdateDomain,
}: DomainFormControlProps ) {
	const [ , isDomainSearchV2Enabled ] = useIsDomainSearchV2Enabled( flow ?? '' );

	const selectedSite = useSelector( getSelectedSite );
	const productsList = useSelector( getAvailableProductsList );

	const { domainForm, siteTitle } = useSelect(
		( select ) => ( {
			domainForm: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainForm(),
			siteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
		} ),
		[]
	);

	const { setDomainForm } = useDispatch( ONBOARD_STORE );

	const [ searchOnInitialRender, setSearchOnInitialRender ] = useState( true );

	const path = '/setup/onboarding/domains';
	let showExampleSuggestions: boolean | undefined = undefined;
	let includeWordPressDotCom: boolean | undefined = undefined;
	let showSkipButton: boolean | undefined = undefined;
	let shouldQuerySubdomains: boolean = true;

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

	if ( flow === DOMAIN_UPSELL_FLOW ) {
		includeWordPressDotCom = false;
	}

	if ( flow === HUNDRED_YEAR_PLAN_FLOW ) {
		includeWordPressDotCom = false;
		shouldQuerySubdomains = false;
	}

	if ( flow === HUNDRED_YEAR_DOMAIN_FLOW ) {
		includeWordPressDotCom = false;
		shouldQuerySubdomains = false;
	}

	if ( isDomainSearchV2Enabled && flow === COPY_SITE_FLOW ) {
		showSkipButton = true;
	}

	if (
		isDomainSearchV2Enabled &&
		[ NEWSLETTER_FLOW, READYMADE_TEMPLATE_FLOW, REBLOGGING_FLOW, START_WRITING_FLOW ].includes(
			flow ?? ''
		)
	) {
		includeWordPressDotCom = true;
		showSkipButton = true;
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
		if ( HUNDRED_YEAR_PLAN_FLOW === flow ) {
			return null;
		}

		const useYourDomain = (
			<div className="domains__domain-side-content">
				<SideExplainer onClick={ handleUseYourDomainClick } type="use-your-domain" />
			</div>
		);

		return (
			<div className="domains__domain-side-content-container">
				<div className="domains__domain-side-content domains__free-domain">
					<SideExplainer
						onClick={ handleDomainExplainerClick }
						type="free-domain-explainer"
						flowName={ flow }
					/>
				</div>
				{ useYourDomain }
			</div>
		);
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

		return typeof domainForm?.lastQuery === 'string' && domainForm?.lastQuery.includes( '.blog' );
	};

	const renderYourDomainForm = () => {
		return (
			<div className="domains__step-section-wrapper" key="useYourDomainForm">
				<CalypsoShoppingCartProvider>
					<UseMyDomain
						analyticsSection={ analyticsSection }
						initialQuery={ domainForm?.lastQuery }
						initialMode={ inputMode.domainInput }
						onNextStep={ null }
						isSignupStep
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
			}
		}

		if ( 'undefined' === typeof showExampleSuggestions ) {
			showExampleSuggestions = true;
		}

		const RegisterDomainStepComponent = isDomainSearchV2Enabled
			? RegisterDomainStepV2
			: RegisterDomainStep;

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStepComponent
					isCartPendingUpdate={ isCartPendingUpdate }
					isCartPendingUpdateDomain={ isCartPendingUpdateDomain }
					analyticsSection={ analyticsSection }
					basePath={ path }
					deemphasiseTlds={ flow === 'ecommerce' ? [ 'blog' ] : [] }
					designType={ undefined }
					domainsWithPlansOnly={ domainsWithPlansOnly }
					includeDotBlogSubdomain={ shouldIncludeDotBlogSubdomain() }
					includeWordPressDotCom={ includeWordPressDotCom ?? true }
					initialState={ initialState }
					isPlanSelectionAvailableInFlow={ isPlanSelectionAvailableLaterInFlow }
					isOnboarding
					sideContent={ getSideContent() }
					isSignupStep
					key="domainForm"
					offerUnavailableOption
					onAddDomain={ onAddDomain }
					onAddMapping={ onAddMapping }
					onSave={ setDomainForm }
					onSkip={ onSkip }
					products={ productsList }
					selectedSite={ selectedSite }
					showExampleSuggestions={ showExampleSuggestions }
					showSkipButton={ showSkipButton }
					shouldQuerySubdomains={ shouldQuerySubdomains }
					suggestion={ initialQuery }
					handleClickUseYourDomain={ ( event: React.MouseEvent, domain: string ) =>
						onUseYourDomainClick( domain )
					}
					vendor={ getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: false,
						flowName: flow,
					} ) }
					// RegisterDomainStepComponentV2 props below
					onContinue={ onContinue }
					shouldRenderUseYourDomain
					showFreeDomainPromo={
						! [ HUNDRED_YEAR_DOMAIN_FLOW, HUNDRED_YEAR_PLAN_FLOW ].includes( flow ?? '' )
					}
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	let content;
	let sideContent;
	if ( showUseYourDomain ) {
		content = renderYourDomainForm();
	} else {
		content = renderDomainForm();
	}

	if ( isDomainUpsellFlow( flow ) && ! showUseYourDomain && ! isDomainSearchV2Enabled ) {
		sideContent = getSideContent();
	}

	return (
		<>
			{ isEmpty( productsList ) && <QueryProductsList /> }
			<div className="domains__step-content domains__step-content-domain-step">
				{ content } { sideContent }
			</div>
		</>
	);
}
