import { useMemo } from 'react';
import { getStepFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

const useIsUpdatedBadgeDesign = () => {
	const route = useSelector( ( state ) => getCurrentRoute( state ) );
	const step = useMemo( () => getStepFromURL( route ), [ route ] );
	return [ 'designsetup', 'design-setup' ].includes( step?.toLowerCase() ?? '' );
};

export default useIsUpdatedBadgeDesign;
