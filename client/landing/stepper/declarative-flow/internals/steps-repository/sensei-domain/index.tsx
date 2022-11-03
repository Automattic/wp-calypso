/* eslint-disable wpcalypso/jsx-classname-namespace */
import { SenseiStepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE, PRODUCTS_LIST_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';

import './style.scss';

const SenseiDomain: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
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
		<SenseiStepContainer stepName="senseiDomain" recordTracksEvent={ recordTracksEvent }>
			<CalypsoShoppingCartProvider>
				<FormattedHeader
					id="choose-a-domain-header"
					headerText="Choose a domain"
					subHeaderText={
						<>
							{ __( 'Make your course site shine with a custom domain. Not sure yet ?' ) }
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
				<div className="container domains__step-content domains__step-content-domain-step">
					<RegisterDomainStep
						// vendor={ SENSEI_FLOW }
						key="domainForm"
						suggestion={ domainSuggestion }
						domainsWithPlansOnly
						isSignupStep={ true }
						includeWordPressDotCom
						onAddDomain={ onAddDomain }
						onSkip={ onSkip }
						products={ productsList }
						useProvidedProductsList
						showSkipButton
						align="left"
						isWideLayout={ true }
					/>
					<div className="domains__domain-side-content-container">
						<div className="domains__domain-side-content domains__free-domain">
							<ReskinSideExplainer onClick={ onSkip } type="free-domain-explainer" />
						</div>
						<div className="domains__domain-side-content">
							<ReskinSideExplainer onClick={ onSkip } type="use-your-domain" />
						</div>
					</div>
				</div>
			</CalypsoShoppingCartProvider>
		</SenseiStepContainer>
	);
};

export default SenseiDomain;
