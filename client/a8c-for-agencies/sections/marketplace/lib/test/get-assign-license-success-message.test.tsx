/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { translate } from 'i18n-calypso';
import getAssignLicenseSuccessMessage from '../get-assign-license-success-message';
import type { ProductInfo } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

const product = ( name: string, status: ProductInfo[ 'status' ] = 'fulfilled' ): ProductInfo => ( {
	name,
	key: `${ name.toLowerCase() }_key`,
	status,
} );

const renderMessage = ( selectedSite: string, selectedProducts: ProductInfo[] ) => {
	const message = getAssignLicenseSuccessMessage( translate, { selectedSite, selectedProducts } );
	render( <div data-testid="message">{ message }</div> );
	return screen.getByTestId( 'message' ).textContent;
};

describe( 'getAssignLicenseSuccessMessage', () => {
	it( 'names the product and the site it was assigned to', () => {
		expect( renderMessage( 'https://example.com', [ product( 'Jetpack Backup' ) ] ) ).toContain(
			'Jetpack Backup was successfully assigned to https://example.com'
		);
	} );

	it( 'only mentions the product that was actually assigned', () => {
		const message = renderMessage( 'https://example.com', [
			product( 'Jetpack Scan', 'rejected' ),
			product( 'Jetpack Backup' ),
		] );

		expect( message ).toContain( 'Jetpack Backup was successfully assigned' );
		expect( message ).not.toContain( 'Jetpack Scan' );
	} );

	it( 'returns null when nothing was assigned', () => {
		expect(
			getAssignLicenseSuccessMessage( translate, {
				selectedSite: 'https://example.com',
				selectedProducts: [ product( 'Jetpack Backup', 'rejected' ) ],
			} )
		).toBeNull();
	} );

	it( 'returns null when the site is unknown', () => {
		expect(
			getAssignLicenseSuccessMessage( translate, {
				selectedSite: '',
				selectedProducts: [ product( 'Jetpack Backup' ) ],
			} )
		).toBeNull();
	} );
} );
