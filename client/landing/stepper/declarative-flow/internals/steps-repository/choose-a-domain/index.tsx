/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from 'calypso/../packages/onboarding/src';
import RegisterDomainStep from 'calypso/components/domains/register-domain-step';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';

import './style.scss';

const ChooseADomain: Step = function ChooseADomain( { navigation, flow, data } ) {
	const { goNext, goBack, submit } = navigation;
	const isVideoPressFlow = 'videopress' === flow;

	const onSkip = () => {
		submit?.( { domainName: '' } );
	};

	const getDefaultStepContent = () => <h1>Choose a domain step</h1>;

	const getVideoPressFlowStepContent = () => {
		const onAddDomain = ( { domain_name }: any ) => {
			submit?.( { domainName: domain_name } );
		};

		const domainSuggestion = data?.domainName ?? data?.siteTitle ?? '';

		return (
			<CalypsoShoppingCartProvider>
				<RegisterDomainStep
					basePath={ '' }
					suggestion={ domainSuggestion }
					domainsWithPlansOnly={ false }
					isSignupStep={ true }
					includeWordPressDotCom={ true }
					includeDotBlogSubdomain={ true }
					showAlreadyOwnADomain={ false }
					onAddDomain={ onAddDomain }
					onSkip={ onSkip }
					promoTlds={ [ 'video', 'studio', 'productions', 'com' ] }
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
						Make your video site shine with a custom domain. Not sure yet ?{ ' ' }
						<button
							className="button navigation-link step-container__navigation-link has-underline is-borderless"
							onClick={ onSkip }
						>
							Decide later.
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
	);
};

export default ChooseADomain;
