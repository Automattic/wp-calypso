import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { useEffect, useRef } from 'react';

export type OnNavigatorPathChange = ( path?: string ) => void;

const useNavigatorListener = ( onNavigatorPathChange?: OnNavigatorPathChange ) => {
	const { location } = useNavigator();
	const previousPathRef = useRef( '' );

	useEffect( () => {
		if ( location.path && location.path !== previousPathRef.current ) {
			onNavigatorPathChange?.( location.path );
			previousPathRef.current = location.path;
		}
	}, [ location.path, onNavigatorPathChange ] );
};

export default useNavigatorListener;
