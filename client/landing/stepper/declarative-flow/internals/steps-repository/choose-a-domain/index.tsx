/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import QueryProductsList from 'calypso/components/data/query-products-list';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE, PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';
import type { ProductsListSelect, OnboardSelect } from '@automattic/data-stores';

import './style.scss';

const ChooseADomain: Step = function ChooseADomain( { navigation, flow } ) {
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();
	const isVideoPressFlow = 'videopress' === flow;
	const { siteTitle, domain, productsList } = useSelect(
		( select ) => ( {
			siteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			domain: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
			productsList: ( select( PRODUCTS_LIST_STORE ) as ProductsListSelect ).getProductsList(),
		} ),
		[]
	);
	const { setDomain } = useDispatch( ONBOARD_STORE );

	const onSkip = () => {
		setDomain( domain );
		submit?.( { domain: domain } );
	};

	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;

	const getVideoPressFlowStepContent = () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const onAddDomain = ( selectedDomain: any ) => {
			setDomain( selectedDomain );
			submit?.( { domain: selectedDomain } );
		};

		const domainSuggestion = domain ? domain.domain_name : siteTitle;

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					vendor={ flow }
					basePath=""
					suggestion={ domainSuggestion }
					domainsWithPlansOnly={ true }
					isSignupStep={ true }
					includeWordPressDotCom={ true }
					includeDotBlogSubdomain={ false }
					showAlreadyOwnADomain={ false }
					onAddDomain={ onAddDomain }
					onSkip={ onSkip }
					products={ productsList }
					useProvidedProductsList={ true }
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

	const getFormattedHeader = () => {
		if ( ! isVideoPressFlow ) {
			return undefined;
		}

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
	};

	const stepContent = isVideoPressFlow ? getVideoPressFlowStepContent() : getDefaultStepContent();

	return (
		<>
			<QueryProductsList />
			<StepContainer
				stepName="chooseADomain"
				shouldHideNavButtons={ isVideoPressFlow }
				goBack={ goBack }
				goNext={ goNext }
				isHorizontalLayout={ false }
				isWideLayout={ true }
				isLargeSkipLayout={ false }
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
				formattedHeader={ getFormattedHeader() }
			/>
		</>
	);
};

export default ChooseADomain;
