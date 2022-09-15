/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE, PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';

import './style.scss';

const ChooseADomain: Step = function ChooseADomain( { navigation, flow } ) {
	const { goNext, goBack, submit } = navigation;
	const { __ } = useI18n();
	const isVideoPressFlow = 'videopress' === flow;
	const [ siteTitle, domain, productsList ] = useSelect( ( select ) => {
		return [
			select( ONBOARD_STORE ).getSelectedSiteTitle(),
			select( ONBOARD_STORE ).getSelectedDomain(),
			select( PRODUCTS_LIST_STORE ).getProductsList(),
		];
	} );
	const { setDomain } = useDispatch( ONBOARD_STORE );

	const onSkip = () => {
		setDomain( domain );
		submit?.( { domain: domain } );
	};

	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;

	const getVideoPressFlowStepContent = () => {
		const onAddDomain = ( selectedDomain: any ) => {
			setDomain( selectedDomain );
			submit?.( { domain: selectedDomain } );
		};

		const domainSuggestion = domain ? domain.domain_name : siteTitle;
		const promoTlds = [
			'video',
			'tube',
			'movie',
			'live',
			'network',
			'news',
			'show',
			'watch',
			'media',
			'productions',
			'digital',
			'plus',
			'online',
			'film',
			'tv',
			'studio',
			'com',
		];

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					basePath={ '' }
					suggestion={ domainSuggestion }
					domainsWithPlansOnly={ true }
					isSignupStep={ true }
					includeWordPressDotCom={ true }
					includeDotBlogSubdomain={ false }
					showAlreadyOwnADomain={ true }
					onAddDomain={ onAddDomain }
					onSkip={ onSkip }
					promoTlds={ promoTlds }
					products={ productsList }
					useProvidedProductsList={ true }
				/>
			</CalypsoShoppingCartProvider>
		);
	};

	const getFormattedHeader = () => {
		if ( ! isVideoPressFlow ) {
			return undefined;
		}

		return (
			<FormattedHeader
				id={ 'choose-a-domain-header' }
				headerText="Choose a domain"
				subHeaderText={
					<>
						{ __( 'Make your video site shine with a custom domain. Not sure yet ?' ) }
						<button
							className="button navigation-link step-container__navigation-link has-underline is-borderless"
							onClick={ onSkip }
						>
							{ __( 'Decide later.' ) }
						</button>
					</>
				}
				align={ 'center' }
			/>
		);
	};

	const stepContent = isVideoPressFlow ? getVideoPressFlowStepContent() : getDefaultStepContent();

	return (
		<StepContainer
			stepName={ 'chooseADomain' }
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
	);
};

export default ChooseADomain;
