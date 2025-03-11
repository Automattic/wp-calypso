/* eslint-disable wpcalypso/jsx-classname-namespace */
import { ProductsList } from '@automattic/data-stores';
import { START_WRITING_FLOW, isStartWritingFlow } from '@automattic/onboarding';
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
import type { DomainSuggestion } from '@automattic/data-stores';
import './style.scss';

const ChooseADomain: Step = function ChooseADomain( { navigation, flow } ) {
	const { setHideFreePlan, setDomainCartItem, setDomain } = useDispatch( ONBOARD_STORE );
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();
	const { productsList } = useSelect(
		( select ) => ( {
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
		if ( isStartWritingFlow( flow ) ) {
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

	const getStepContent = () => {
		switch ( flow ) {
			case START_WRITING_FLOW:
				return getBlogOnboardingFlowStepContent();
			default:
				return getDefaultStepContent();
		}
	};

	const getFormattedHeader = () => {
		if ( isStartWritingFlow( flow ) ) {
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
				shouldHideNavButtons={ false }
				hideSkip={ isStartWritingFlow( flow ) }
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
