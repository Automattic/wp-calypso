import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DIFMLanding from 'calypso/my-sites/marketing/do-it-for-me/difm-landing';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import type { Step } from '../../types';

const STEP_NAME = 'difmStartingPoint';
const DIFMStartingPoint: Step = function ( { navigation } ) {
	const { goNext, goBack, submit } = navigation;
	const translate = useTranslate();
	const existingSiteCount = useSelector( ( state ) => getCurrentUserSiteCount( state ) );
	const siteId = useSite()?.ID;
	const showNewOrExistingSiteChoice = existingSiteCount > 0;

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
				skipLabelText={ translate( 'No Thanks, I’ll Build It' ) }
				stepContent={
					<DIFMLanding
						onPrimarySubmit={ () =>
							showNewOrExistingSiteChoice ? onSubmit( 'existing-site' ) : onSubmit( 'new-site' )
						}
						onSecondarySubmit={ () => onSubmit( 'new-site' ) }
						showNewOrExistingSiteChoice={ existingSiteCount }
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
