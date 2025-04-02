import { StepContainer, DIFM_FLOW, Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DIFMLanding from 'calypso/my-sites/marketing/do-it-for-me/difm-landing';
import HelpCenterStepButton from 'calypso/signup/help-center-step-button';
import useShouldRenderHelpCenterButton from 'calypso/signup/help-center-step-button/use-should-render-help-center-button';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { StepContainerV2DIFMStartingPoint } from './step-container-v2-difm-starting-point';
import type { Step as StepType } from '../../types';
import type { AppState } from 'calypso/types';

const STEP_NAME = 'difmStartingPoint';

const DIFMStartingPoint: StepType< {
	submits: { newOrExistingSiteChoice: 'existing-site' | 'new-site' };
} > = function ( { flow, navigation } ) {
	const { goNext, goBack, submit } = navigation;
	const translate = useTranslate();
	const existingSiteCount = useSelector( ( state: AppState ) => getCurrentUserSiteCount( state ) );
	const siteId = useSite()?.ID;
	const showNewOrExistingSiteChoice = ! siteId && !! existingSiteCount && existingSiteCount > 0;

	const queryParams = new URLSearchParams( window?.location.search );
	const flags = queryParams.get( 'flags' )?.split( ',' );
	const isHelpCenterLinkEnabled = flags?.includes( 'signup/help-center-link' );

	const shouldRenderHelpCenterLink = useShouldRenderHelpCenterButton( {
		flowName: DIFM_FLOW,
		enabledGeos: [ 'US' ],
	} );

	const shouldRenderHelpCenter = isHelpCenterLinkEnabled && shouldRenderHelpCenterLink;

	const onSubmit = ( value: 'existing-site' | 'new-site' ) => {
		submit?.( {
			newOrExistingSiteChoice: value,
		} );
	};

	if ( shouldUseStepContainerV2( flow ) ) {
		const primaryButton = showNewOrExistingSiteChoice ? (
			<Step.NextButton
				onClick={ () => onSubmit( 'existing-site' ) }
				label={ translate( 'Use an existing site' ) }
			/>
		) : (
			<Step.NextButton
				onClick={ () => onSubmit( 'new-site' ) }
				label={ translate( 'Get started' ) }
			/>
		);

		const secondaryButton = showNewOrExistingSiteChoice ? (
			<Step.NextButton
				variant="secondary"
				onClick={ () => onSubmit( 'new-site' ) }
				label={ translate( 'Start a new site' ) }
			/>
		) : undefined;

		return (
			<>
				<DocumentHead title={ translate( 'Let us build your site' ) } />
				<StepContainerV2DIFMStartingPoint
					topBar={
						<Step.TopBar
							backButton={ goBack ? <Step.BackButton onClick={ goBack } /> : undefined }
							skipButton={
								shouldRenderHelpCenter ? (
									<HelpCenterStepButton
										flowName={ DIFM_FLOW }
										enabledGeos={ [ 'US' ] }
										helpCenterButtonCopy={ translate( 'Questions?' ) }
										helpCenterButtonLink={ translate( 'Contact our site-building team' ) }
									/>
								) : (
									<Step.SkipButton
										onClick={ goNext }
										label={ translate( 'No Thanks, I’ll Build It' ) }
									/>
								)
							}
						/>
					}
					stickyBottomBar={
						<Step.StickyBottomBar leftButton={ secondaryButton } rightButton={ primaryButton } />
					}
					primaryButton={ primaryButton }
					secondaryButton={ secondaryButton }
					siteId={ siteId }
				/>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ translate( 'Let us build your site' ) } />
			<StepContainer
				stepName={ STEP_NAME }
				goBack={ goBack }
				goNext={ goNext }
				isHorizontalLayout
				isWideLayout
				isLargeSkipLayout={ false }
				skipLabelText={
					shouldRenderHelpCenter ? undefined : translate( 'No Thanks, I’ll Build It' )
				}
				hideSkip={ shouldRenderHelpCenter }
				customizedActionButtons={
					shouldRenderHelpCenter ? (
						<HelpCenterStepButton
							flowName={ flow }
							enabledGeos={ [ 'US' ] }
							helpCenterButtonCopy={ translate( 'Questions?' ) }
							helpCenterButtonLink={ translate( 'Contact our site building team' ) }
						/>
					) : undefined
				}
				stepContent={
					<DIFMLanding
						onPrimarySubmit={ () =>
							showNewOrExistingSiteChoice ? onSubmit( 'existing-site' ) : onSubmit( 'new-site' )
						}
						onSecondarySubmit={ () => onSubmit( 'new-site' ) }
						showNewOrExistingSiteChoice={ showNewOrExistingSiteChoice }
						siteId={ siteId }
						isStoreFlow={ false }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default DIFMStartingPoint;
