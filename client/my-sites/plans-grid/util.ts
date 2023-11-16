import {
	FEATURE_1GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_50GB_STORAGE,
	FEATURE_200GB_STORAGE,
	FEATURE_50GB_STORAGE_ADD_ON,
	FEATURE_100GB_STORAGE_ADD_ON,
	FEATURE_P2_3GB_STORAGE,
	FEATURE_P2_13GB_STORAGE,
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
		case FEATURE_50GB_STORAGE:
			return translate( '50 GB' );
		case FEATURE_P2_3GB_STORAGE:
			return translate( '3 GB' );
		case FEATURE_P2_13GB_STORAGE:
			return translate( '13 GB' );
		// TODO: Remove when upgradeable storage is released in plans 2023
		case FEATURE_200GB_STORAGE:
			return translate( '200 GB' );
		// Displayed string is the Add On + default 50GB storage
		case FEATURE_50GB_STORAGE_ADD_ON:
			return translate( '100 GB' );
		case FEATURE_100GB_STORAGE_ADD_ON:
			return translate( '150 GB' );
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
