/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useLocale } from '@automattic/i18n-utils';
import { useI18n } from '@wordpress/react-i18n';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import PlansGrid from 'calypso/../packages/plans-grid/src/plans-grid';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';

const ChooseAPlan: Step = function ChooseAPlan( { navigation, flow, data } ) {
	const { goNext, goBack, submit } = navigation;
	const isVideoPressFlow = 'videopress' === flow;
	const { __ } = useI18n();
	const locale = useLocale();

	const onSkip = () => {};

	const getDefaultStepContent = () => <h1>Choose a plan step</h1>;

	const getVideoPressFlowStepContent = () => {
		const domainName = data?.domainName ?? '';
		const onPlanSelect = () => {};

		return (
			<CalypsoShoppingCartProvider>
				<PlansGrid
					header={ <h1>Test</h1> }
					currentDomain={ undefined }
					onPlanSelect={ onPlanSelect }
					currentPlanProductId={ undefined }
					onPickDomainClick={ undefined }
					isAccordion={ false }
					selectedFeatures={ undefined }
					locale={ locale }
					onBillingPeriodChange={ undefined }
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
				id={ 'choose-a-plan-header' }
				headerText="Choose a plan"
				subHeaderText={
					<>
						{ __( 'Unlock a powerful bundle of features for your video site.' ) }
						<button
							className="button navigation-link step-container__navigation-link has-underline is-borderless"
							onClick={ onSkip }
						>
							{ __( 'Or start with a free plan.' ) }
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
			stepName={ 'chooseAPlan' }
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

export default ChooseAPlan;
