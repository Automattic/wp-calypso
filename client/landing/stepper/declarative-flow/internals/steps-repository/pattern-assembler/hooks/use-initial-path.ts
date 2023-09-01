import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INITIAL_PATH } from '../constants';

const useInitialPath = () => {
	const [ searchParams ] = useSearchParams();

	return useMemo( () => {
		const screen = searchParams.get( 'screen' );
		const screenParameter = searchParams.get( 'screen_parameter' );
		if ( ! screen ) {
			return INITIAL_PATH;
		}

		return [ screen, screenParameter ]
			.filter( Boolean )
			.map( ( path ) => `/${ path }` )
			.join( '' );
	}, [] );
};

export default useInitialPath;
