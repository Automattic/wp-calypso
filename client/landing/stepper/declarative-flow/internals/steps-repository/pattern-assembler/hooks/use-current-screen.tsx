import { useSearchParams } from 'react-router-dom';
import { INITIAL_SCREEN } from '../constants';
import useScreen, { UseScreenOptions } from './use-screen';
import type { ScreenName } from '../types';

const useCurrentScreen = ( options: UseScreenOptions ) => {
	const [ searchParams ] = useSearchParams();
	const currentScreenName = ( searchParams.get( 'screen' ) ?? INITIAL_SCREEN ) as ScreenName;
	const currentScreen = useScreen( currentScreenName, options );

	return currentScreen;
};

export default useCurrentScreen;
