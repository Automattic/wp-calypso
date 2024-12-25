import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useMemo } from 'react';
import { getStepFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';

const useIsUpdatedBadgeDesign = () => {
	const step = useMemo( () => getStepFromURL(), [] );
	// TODO: Remove this after translations are completed
	const hasEnTranslation = useHasEnTranslation();
	const isEligible = hasEnTranslation( '%(planName)s + %(price)s/mo' );
	return isEligible ? step?.toLowerCase() === 'designsetup' : false;
};

export default useIsUpdatedBadgeDesign;
