import { useSearchParams } from 'react-router-dom';
import { INITIAL_SCREEN } from '../constants';
import useScreen from './use-screen';
import type { ScreenName } from '../types';

const useCurrentScreen = ( shouldUnlockGlobalStyles = false ) => {
	const [ searchParams ] = useSearchParams();
	const currentScreenName = ( searchParams.get( 'screen' ) ?? INITIAL_SCREEN ) as ScreenName;
	const currentScreen = useScreen( currentScreenName, shouldUnlockGlobalStyles );

	return currentScreen;
};

export default useCurrentScreen;
