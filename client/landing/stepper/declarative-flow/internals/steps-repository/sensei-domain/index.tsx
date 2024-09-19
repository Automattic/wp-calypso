/* eslint-disable wpcalypso/jsx-classname-namespace */
import { ProductsList } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import ReskinSideExplainer from 'calypso/components/domains/reskin-side-explainer';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { SenseiStepContainer } from '../components/sensei-step-container';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';

import './style.scss';

const SenseiDomain: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const { __ } = useI18n();
	const { siteTitle, domain, productsList } = useSelect(
		( select ) => ( {
			siteTitle: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteTitle(),
			domain: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
			productsList: select( ProductsList.store ).getProductsList(),
		} ),
		[]
	);
	const { setDomain } = useDispatch( ONBOARD_STORE );

	const onSkip = () => {
		setDomain( domain );
		submit?.();
	};

	const onAddDomain = ( selectedDomain: typeof domain ) => {
		setDomain( selectedDomain );
		submit?.();
	};

	const domainSuggestion = domain?.domain_name ?? siteTitle;

	return (
		<SenseiStepContainer
			stepName="senseiDomain"
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				<FormattedHeader
					id="choose-a-domain-header"
					headerText={ __( 'Choose a domain' ) }
					subHeaderText={
						<>
							{ __( 'Make your course site shine with a custom domain. Not sure yet?' ) }{ ' ' }
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
			}
		>
			<CalypsoShoppingCartProvider>
				<div className="container domains__step-content domains__step-content-domain-step">
					<RegisterDomainStep
						vendor="sensei"
						key="domainForm"
						suggestion={ domainSuggestion }
						domainsWithPlansOnly
						isSignupStep
						includeWordPressDotCom
						onAddDomain={ onAddDomain }
						onSkip={ onSkip }
						products={ productsList }
						useProvidedProductsList
						align="left"
						isWideLayout
						basePath=""
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
