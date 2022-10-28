/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer, SenseiStepContent, SENSEI_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import { ONBOARD_STORE, PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';

const SenseiDomain: Step = ( { navigation } ) => {
	const { submit } = navigation;
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

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onAddDomain = ( selectedDomain: any ) => {
		setDomain( selectedDomain );
		submit?.( { domain: selectedDomain } );
	};

	const domainSuggestion = domain ? domain.domain_name : siteTitle;

	return (
		<StepContainer
			stepName="senseiDomain"
			flowName={ SENSEI_FLOW }
			isWideLayout
			hideFormattedHeader
			recordTracksEvent={ recordTracksEvent }
			shouldHideNavButtons
			stepContent={
				<CalypsoShoppingCartProvider>
					<SenseiStepContent>
						<RegisterDomainStep
							suggestion={ domainSuggestion }
							domainsWithPlansOnly
							isSignupStep
							basePath=""
							includeWordPressDotCom
							onAddDomain={ onAddDomain }
							onSkip={ onSkip }
							products={ productsList }
							useProvidedProductsList
							showSkipButton
						/>
					</SenseiStepContent>
				</CalypsoShoppingCartProvider>
			}
		/>
	);
};

export default SenseiDomain;
