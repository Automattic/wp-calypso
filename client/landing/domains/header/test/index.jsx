/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import DomainsLandingHeader from '..';

describe( 'DomainsLandingHeader', () => {
	test.each( [ 'spacefast_live', 'spacefast_ote' ] )(
		'shows the Spacefast wordmark for the %s reseller',
		( reseller ) => {
			render( <DomainsLandingHeader reseller={ reseller } /> );

			expect( screen.getByRole( 'img', { name: 'Spacefast' } ) ).toBeVisible();
		}
	);
} );
