import { useNavigatorListener } from '@automattic/onboarding';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INITIAL_SCREEN } from '../constants';

const useSyncNavigatorScreen = () => {
	const [ , setSearchParams ] = useSearchParams();
	const handleNavigatorPathChange = useCallback(
		( path = '' ) => {
			setSearchParams(
				( currentSearchParams ) => {
					const [ screen, screenParameter ] = path.split( '/' ).slice( 1 );
					currentSearchParams.set( 'screen', screen ?? INITIAL_SCREEN );
					if ( screenParameter ) {
						currentSearchParams.set( 'screen_parameter', screenParameter );
					} else {
						currentSearchParams.delete( 'screen_parameter' );
					}
					return currentSearchParams;
				},
				{ replace: true }
			);
		},
		[ setSearchParams ]
	);

	useNavigatorListener( handleNavigatorPathChange );
};

export default useSyncNavigatorScreen;
