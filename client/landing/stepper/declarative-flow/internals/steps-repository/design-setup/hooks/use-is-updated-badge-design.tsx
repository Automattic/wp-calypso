import { useLocale } from '@automattic/i18n-utils';
import { useMemo } from 'react';
import { useGoalsFirstExperiment } from 'calypso/landing/stepper/declarative-flow/helpers/use-goals-first-experiment';
import { getStepFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';

const useIsUpdatedBadgeDesign = () => {
	// TODO: Remove the locale and isGoalsAtFrontExperiment check after translations are complete.
	const [ , isGoalsAtFrontExperiment ] = useGoalsFirstExperiment();
	const locale = useLocale();
	const isEligible = isGoalsAtFrontExperiment || locale === 'en';

	const step = useMemo( () => getStepFromURL(), [] );

	return isEligible ? step === 'designSetup' : false;
};

export default useIsUpdatedBadgeDesign;
