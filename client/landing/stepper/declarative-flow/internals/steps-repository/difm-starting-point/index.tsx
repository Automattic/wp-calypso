import { englishLocales } from '@automattic/i18n-utils';
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

	const onSubmit = ( value: 'existing-site' | 'new-site' ) => {
		submit?.( {
			newOrExistingSiteChoice: value,
		} );
	};

	const helpCenterButtonCopy = translate( 'Questions?' );
	const helpCenterButtonLink = translate( 'Contact our site-building team' );
	const shouldRenderHelpCenter = useShouldRenderHelpCenterButton( {
		flowName: DIFM_FLOW,
		enabledLocales: englishLocales,
	} );

	if ( shouldUseStepContainerV2( flow ) ) {
		const primaryButton = showNewOrExistingSiteChoice ? (
			<Step.PrimaryButton onClick={ () => onSubmit( 'existing-site' ) }>
				{ translate( 'Use an existing site' ) }
			</Step.PrimaryButton>
		) : (
			<Step.PrimaryButton onClick={ () => onSubmit( 'new-site' ) }>
				{ translate( 'Get started' ) }
			</Step.PrimaryButton>
		);

		const secondaryButton = showNewOrExistingSiteChoice ? (
			<Step.SecondaryButton onClick={ () => onSubmit( 'new-site' ) }>
				{ translate( 'Start a new site' ) }
			</Step.SecondaryButton>
		) : undefined;

		return (
			<>
				<DocumentHead title={ translate( 'Let us build your site' ) } />
				<StepContainerV2DIFMStartingPoint
					topBar={
						<Step.TopBar
							leftElement={ goBack ? <Step.BackButton onClick={ goBack } /> : undefined }
							rightElement={
								shouldRenderHelpCenter ? (
									<HelpCenterStepButton
										flowName={ DIFM_FLOW }
										enabledLocales={ englishLocales }
										helpCenterButtonCopy={ helpCenterButtonCopy }
										helpCenterButtonLink={ helpCenterButtonLink }
									/>
								) : (
									<Step.SkipButton onClick={ goNext }>
										{ translate( 'No thanks, I’ll build it' ) }
									</Step.SkipButton>
								)
							}
						/>
					}
					stickyBottomBar={
						<Step.StickyBottomBar leftElement={ secondaryButton } rightElement={ primaryButton } />
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
					shouldRenderHelpCenter ? undefined : translate( 'No thanks, I’ll build it' )
				}
				hideSkip={ shouldRenderHelpCenter }
				customizedActionButtons={
					shouldRenderHelpCenter ? (
						<HelpCenterStepButton
							flowName={ DIFM_FLOW }
							enabledLocales={ englishLocales }
							helpCenterButtonCopy={ helpCenterButtonCopy }
							helpCenterButtonLink={ helpCenterButtonLink }
						/>
					) : undefined
				}
				stepContent={
					<DIFMLanding
						onPrimarySubmit={ () =>
							showNewOrExistingSiteChoice ? onSubmit( 'new-site' ) : onSubmit( 'existing-site' )
						}
						onSecondarySubmit={ () => onSubmit( 'existing-site' ) }
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
