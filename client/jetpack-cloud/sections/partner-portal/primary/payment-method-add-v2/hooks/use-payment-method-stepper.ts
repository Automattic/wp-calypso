import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

export function usePaymentMethodStepper() {
	const translate = useTranslate();

	const products = ( getQueryArg( window.location.href, 'products' ) ?? '' ).toString();
	const product = ( getQueryArg( window.location.href, 'product' ) ?? '' ).toString();
	const source = ( getQueryArg( window.location.href, 'source' ) || '' ).toString();

	const isIssueLicenseFlow = !! products;
	const isSiteCreationFlow = source === 'create-site' && !! product;

	return useMemo( () => {
		if ( isIssueLicenseFlow ) {
			return {
				steps: [
					translate( 'Select licenses' ),
					translate( 'Review selections' ),
					translate( 'Add Payment Method' ),
					translate( 'Assign licenses' ),
				],
				current: 2,
			};
		}

		if ( isSiteCreationFlow ) {
			return {
				steps: [
					translate( 'Select plan' ),
					translate( 'Add Payment Method' ),
					translate( 'Create site' ),
				],
				current: 1,
			};
		}

		return null;
	}, [ isIssueLicenseFlow, isSiteCreationFlow, translate ] );
}
