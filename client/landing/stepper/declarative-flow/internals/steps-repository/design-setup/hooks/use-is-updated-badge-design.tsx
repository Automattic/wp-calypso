import { useMemo } from 'react';
import { getStepFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';

const useIsUpdatedBadgeDesign = () => {
	const step = useMemo( () => getStepFromURL(), [] );
	return [ 'designsetup', 'design-setup' ].includes( step?.toLowerCase() ?? '' );
};

export default useIsUpdatedBadgeDesign;
