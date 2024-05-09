/* eslint-disable wpcalypso/jsx-classname-namespace */
import { ProductsList } from '@automattic/data-stores';
import {
	DESIGN_FIRST_FLOW,
	START_WRITING_FLOW,
	isBlogOnboardingFlow,
} from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { useState } from 'react';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import QueryProductsList from 'calypso/components/data/query-products-list';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { recordUseYourDomainButtonClick } from 'calypso/components/domains/register-domain-step/analytics';
import FormattedHeader from 'calypso/components/formatted-header';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useChangeSiteDomainIfNeeded from '../../../../hooks/use-change-site-domain-if-needed';
import type { Step } from '../../types';
import type { OnboardSelect, DomainSuggestion } from '@automattic/data-stores';
import './style.scss';

const ChooseADomain: Step = function ChooseADomain( { navigation, flow } ) {
	const { setHideFreePlan, setDomainCartItem, setDomain } = useDispatch( ONBOARD_STORE );
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();
	const isVideoPressFlow = 'videopress' === flow;
	const { siteTitle, domain, productsList } = useSelect(
		( select ) => ( {
			siteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			domain: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
			productsList: select( ProductsList.store ).getProductsList(),
		} ),
		[]
	);
	const [ isCartPendingUpdate, setIsCartPendingUpdate ] = useState( false );
	const [ isCartPendingUpdateDomain, setIsCartPendingUpdateDomain ] =
		useState< DomainSuggestion >();
	const site = useSite();

	const changeSiteDomainIfNeeded = useChangeSiteDomainIfNeeded();

	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onAddDomain = ( selectedDomain: any ) => {
		setDomain( selectedDomain );
		submit?.( { domain: selectedDomain } );
	};

	const onSkip = async () => {
		if ( isBlogOnboardingFlow( flow ) ) {
			setDomain( null );
			setDomainCartItem( undefined );
			setHideFreePlan( false );
			submit?.( { freeDomain: true } );
		} else {
			onAddDomain( null );
		}
	};

	const onClickUseYourDomain = function () {
		recordUseYourDomainButtonClick( flow );
		const siteSlug = getQueryArg( window.location.search, 'siteSlug' );
		window.location.assign(
			addQueryArgs( `/setup/${ flow }/use-my-domain`, {
				siteSlug,
				flowToReturnTo: flow,
				domainAndPlanPackage: true,
				[ flow ]: true,
			} )
		);
	};

	const submitWithDomain = async ( suggestion: DomainSuggestion | undefined ) => {
		setIsCartPendingUpdate( true );
		setIsCartPendingUpdateDomain( suggestion );

		setDomain( suggestion );

		if ( suggestion?.is_free ) {
			setHideFreePlan( false );
			setDomainCartItem( undefined );
		} else {
			const domainCartItem = domainRegistration( {
				domain: suggestion?.domain_name || '',
				productSlug: suggestion?.product_slug || '',
			} );

			setHideFreePlan( true );
			setDomainCartItem( domainCartItem );
		}

		if ( suggestion?.is_free && suggestion?.domain_name ) {
			changeSiteDomainIfNeeded( suggestion?.domain_name );
		}

		submit?.( { freeDomain: suggestion?.is_free, domainName: suggestion?.domain_name } );
	};

	const getBlogOnboardingFlowStepContent = () => {
		const siteName = site?.name;
		const domainSuggestion = siteName && siteName !== 'Site Title' ? siteName : '';

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					key={ domainSuggestion }
					suggestion={ domainSuggestion }
					domainsWithPlansOnly
					onAddDomain={ submitWithDomain }
					includeWordPressDotCom
					offerUnavailableOption={ false }
					showAlreadyOwnADomain={ false }
					isSignupStep
					basePath=""
					products={ productsList }
					vendor={ getSuggestionsVendor( {
						isSignup: true,
						isDomainOnly: false,
						flowName: flow || undefined,
					} ) }
					handleClickUseYourDomain={ onClickUseYourDomain }
					isCartPendingUpdate={ isCartPendingUpdate }
					isCartPendingUpdateDomain={ isCartPendingUpdateDomain }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	const getVideoPressFlowStepContent = () => {
		const domainSuggestion = domain ? domain.domain_name : siteTitle;

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					vendor={ flow }
					basePath=""
					suggestion={ domainSuggestion }
					domainsWithPlansOnly
					isSignupStep
					includeWordPressDotCom
					includeDotBlogSubdomain={ false }
					showAlreadyOwnADomain={ false }
					onAddDomain={ onAddDomain }
					onSkip={ onSkip }
					products={ productsList }
					useProvidedProductsList
					isReskinned
				/>
				<div className="aside-sections">
					<div className="aside-section">
						<h2>{ __( 'Get a free one-year domain with any paid plan.' ) }</h2>
						<span>
							{ __( "You can claim your free custom domain later if you aren't ready yet." ) }
						</span>
						<button
							className="button navigation-link step-container__navigation-link has-underline is-borderless"
							onClick={ onSkip }
						>
							{ __( 'View plans' ) }
						</button>
					</div>
					<span className="aside-spacer"></span>
					<div className="aside-section">
						<h2>{ __( 'Already own a domain?' ) }</h2>
						<span>
							{ __(
								'A domain name is the site address people type in their browser to visit your site.'
							) }
						</span>
						<button
							className="button navigation-link step-container__navigation-link has-underline is-borderless"
							onClick={ onSkip }
						>
							{ __( 'Use a domain I own' ) }
						</button>
					</div>
				</div>
			</CalypsoShoppingCartProvider>
		);
	};

	const getStepContent = () => {
		switch ( flow ) {
			case 'videopress':
				return getVideoPressFlowStepContent();
			case START_WRITING_FLOW:
			case DESIGN_FIRST_FLOW:
				return getBlogOnboardingFlowStepContent();
			default:
				return getDefaultStepContent();
		}
	};

	const getFormattedHeader = () => {
		if ( isVideoPressFlow ) {
			return (
				<FormattedHeader
					id="choose-a-domain-header"
					headerText={ __( 'Choose a domain' ) }
					subHeaderText={
						<>
							{ __( 'Make your video site shine with a custom domain. Not sure yet?' ) }
							<button
								className="button navigation-link step-container__navigation-link has-underline is-borderless"
								onClick={ onSkip }
							>
								{ __( 'Decide later.' ) }
							</button>
						</>
					}
					align="center"
				/>
			);
		}

		if ( isBlogOnboardingFlow( flow ) ) {
			return (
				<FormattedHeader
					id="choose-a-domain-writer-header"
					headerText={ __( 'Your domain. Your identity.' ) }
					subHeaderText={
						<>
							{ __( 'Help your blog stand out with a custom domain. Not sure yet?' ) }
							<button className="formatted-header__subtitle has-underline" onClick={ onSkip }>
								{ __( 'Decide later.' ) }
							</button>
						</>
					}
					align="center"
				/>
			);
		}
	};

	return (
		<>
			<QueryProductsList />
			<StepContainer
				stepName="chooseADomain"
				shouldHideNavButtons={ isVideoPressFlow }
				hideSkip={ isBlogOnboardingFlow( flow ) }
				goBack={ goBack }
				goNext={ goNext }
				isHorizontalLayout={ false }
				isWideLayout
				isLargeSkipLayout={ false }
				stepContent={ getStepContent() }
				recordTracksEvent={ recordTracksEvent }
				formattedHeader={ getFormattedHeader() }
			/>
		</>
	);
};

export default ChooseADomain;
