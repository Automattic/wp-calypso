import { StepContainer, DIFM_FLOW } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DIFMLanding from 'calypso/my-sites/marketing/do-it-for-me/difm-landing';
import HelpCenterStepButton from 'calypso/signup/help-center-step-button';
import useShouldRenderHelpCenterButton from 'calypso/signup/help-center-step-button/use-should-render-help-center-button';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import type { Step } from '../../types';
import type { AppState } from 'calypso/types';

const STEP_NAME = 'difmStartingPoint';
const DIFMStartingPoint: Step = function ( { navigation, flow } ) {
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

	const onSubmit = ( value: string ) => {
		submit?.( {
			newOrExistingSiteChoice: value,
		} );
	};

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
					shouldRenderHelpCenterLink ? undefined : translate( 'No Thanks, I’ll Build It' )
				}
				hideSkip={ shouldRenderHelpCenterLink }
				customizedActionButtons={
					isHelpCenterLinkEnabled ? (
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
