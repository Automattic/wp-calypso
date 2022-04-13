/* eslint-disable wpcalypso/jsx-classname-namespace */
import { StepContainer } from '@automattic/onboarding';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import ImportOnboarding from 'calypso/signup/steps/import';
import { GoToStep } from 'calypso/signup/steps/import/types';
import type { Step } from '../../types';

/**
 * The import step
 */
const ImportStep: Step = function ImportStep( props ) {
	const { navigation } = props;

	const site = useSite();
	const siteSlug = useSiteSlugParam();

	return (
		<StepContainer
			stepName={ 'import-step' }
			hideSkip={ false }
			hideBack={ true }
			hideNext={ true }
			isHorizontalLayout={ false }
			stepContent={
				<ImportOnboarding
					stepName={ 'capture' }
					siteId={ site?.ID as number }
					stepSectionName={ '' }
					signupDependencies={ { siteSlug: siteSlug as string } }
					goToStep={ navigation.goToStep as GoToStep }
					goToNextStep={ navigation.goNext }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default ImportStep;
