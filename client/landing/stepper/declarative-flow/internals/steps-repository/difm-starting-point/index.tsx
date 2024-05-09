import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import DIFMLanding from 'calypso/my-sites/marketing/do-it-for-me/difm-landing';
import type { Step } from '../../types';

import './style.scss';
const STEP_NAME = 'difmStartingPoint';
const DIFMStartingPoint: Step = function ( { navigation } ) {
	const { goNext, goBack, submit } = navigation;
	const translate = useTranslate();

	const onSubmit = () => {
		submit?.();
	};

	const siteId = useSite()?.ID;
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
						onPrimarySubmit={ onSubmit }
						showNewOrExistingSiteChoice={ false }
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
