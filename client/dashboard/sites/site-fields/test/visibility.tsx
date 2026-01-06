/**
 * @jest-environment jsdom
 */
import { render } from '../../../test-utils';
import { wpcomLink } from '../../../utils/link';
import { Visibility } from '../index';
import type { Site } from '@automattic/api-core';

describe( '<Visibility>', () => {
	test( 'for unlaunched sites, it renders "Coming soon" with a "Finish setup" link', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_migration: {},
			launch_status: 'unlaunched',
			is_private: true,
		} as Site;
		const { container, getByRole } = render( <Visibility site={ site } /> );
		expect( container ).toHaveTextContent( 'Finish setup↗' );
		expect( getByRole( 'link', { name: /Finish setup/ } ) ).toHaveAttribute(
			'href',
			wpcomLink( '/home/test.wordpress.com' )
		);
	} );

	test( 'for coming soon sites, it renders "Coming soon"', () => {
		const site = {
			site_migration: {},
			is_coming_soon: true,
		} as Site;
		const { container } = render( <Visibility site={ site } /> );
		expect( container.textContent ).toBe( 'Coming soon' );
	} );

	test( 'for private sites, it renders "Private"', () => {
		const site = {
			site_migration: {},
			is_private: true,
		} as Site;
		const { container } = render( <Visibility site={ site } /> );
		expect( container.textContent ).toBe( 'Private' );
	} );

	test( 'for public sites, it renders "Public"', () => {
		const site = {
			site_migration: {},
			is_private: false,
		} as Site;
		const { container } = render( <Visibility site={ site } /> );
		expect( container.textContent ).toBe( 'Public' );
	} );
} );
