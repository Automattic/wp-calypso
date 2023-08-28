import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { useEffect } from 'react';

const useNavigatorListener = ( onNavigatorPathChange?: ( path?: string ) => void ) => {
	const { location } = useNavigator();
	useEffect( () => {
		onNavigatorPathChange?.( location.path );
	}, [ location.path, onNavigatorPathChange ] );
};

export default useNavigatorListener;
