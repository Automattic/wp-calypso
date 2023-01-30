import {
	FEATURE_1GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_200GB_STORAGE,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';

export const getStorageStringFromFeature = ( storageFeature: string ) => {
	switch ( storageFeature ) {
		case FEATURE_1GB_STORAGE:
			return translate( '1 GB' );
		case FEATURE_6GB_STORAGE:
			return translate( '6 GB' );
		case FEATURE_13GB_STORAGE:
			return translate( '13 GB' );
		case FEATURE_200GB_STORAGE:
			return translate( '200 GB' );
		default:
			return null;
	}
};

export const usePricingBreakpoint = ( targetBreakpoint: number ) => {
	const [ breakpoint, setBreakpoint ] = useState( false );

	const handleResize = useCallback( () => {
		if ( typeof window === 'undefined' ) {
			return;
		}
		setBreakpoint( window.innerWidth < targetBreakpoint );
	}, [ targetBreakpoint ] );

	useEffect( () => {
		window.addEventListener( 'resize', handleResize );
		return () => window.removeEventListener( 'resize', handleResize );
	}, [ handleResize ] );

	useEffect( () => {
		handleResize();
	}, [] );

	return breakpoint;
};
