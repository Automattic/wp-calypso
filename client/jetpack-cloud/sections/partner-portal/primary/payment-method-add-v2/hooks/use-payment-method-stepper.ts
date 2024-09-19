import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';

export function usePaymentMethodStepper( { withAssignLicense }: { withAssignLicense?: boolean } ) {
	const translate = useTranslate();

	const products = ( getQueryArg( window.location.href, 'products' ) ?? '' ).toString();
	const product = ( getQueryArg( window.location.href, 'product' ) ?? '' ).toString();
	const source = ( getQueryArg( window.location.href, 'source' ) || '' ).toString();

	const isIssueLicenseFlow = !! products;
	const isSiteCreationFlow = source === 'create-site' && !! product;

	const isCheckoutFlow = source === 'sitesdashboard';

	return useMemo( () => {
		if ( isCheckoutFlow ) {
			return null;
		}
		if ( isIssueLicenseFlow ) {
			const steps = [
				translate( 'Select licenses' ),
				translate( 'Review selections' ),
				translate( 'Add Payment Method' ),
			];

			if ( withAssignLicense ) {
				steps.push( translate( 'Assign licenses' ) );
			}

			return {
				steps,
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
	}, [ isCheckoutFlow, isIssueLicenseFlow, isSiteCreationFlow, translate, withAssignLicense ] );
}
