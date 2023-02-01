import {
	FEATURE_1GB_STORAGE,
	FEATURE_6GB_STORAGE,
	FEATURE_13GB_STORAGE,
	FEATURE_200GB_STORAGE,
	isEcommercePlan,
} from '@automattic/calypso-products';
import { translate, TranslateResult } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';

/**
 * This is a temporary fix since an actual plan name change is going to be time consuming.
 * The change from eCommerce to Commerce however is quite minor. So we do a Frontend only cosmetic change for now.
 *
 * @param planName The name of the plan
 * @param planTitle Display name of the plan
 * @returns Overridden display name if this is the eCommerce plan
 */
export function resolvePlanName( planName: string, planTitle: TranslateResult ): TranslateResult {
	if ( isEcommercePlan( planName ) ) {
		return translate( 'Commerce' );
	}
	return planTitle;
}

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
