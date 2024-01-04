/** @jest-environment jsdom */
import { getPlan } from '@automattic/calypso-products';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'calypso/state';
import ThemeTierStyleVariationBadge from '../theme-tier-style-variation-badge';

jest.mock( 'calypso/state' );
jest.mock( '@automattic/calypso-products' );

describe( 'ThemeTierStyleVariationBadge', () => {
	const siteSlug = 'example.wordpress.com';
	let originalWindowLocation;

	beforeEach( () => {
		jest.clearAllMocks();

		originalWindowLocation = global.window.location;
		delete global.window.location;
		global.window.location = {
			href: 'http://wwww.example.com',
			origin: 'http://www.example.com',
		};

		useSelector.mockImplementation( () => siteSlug );
	} );

	afterEach( () => {
		global.window.location = originalWindowLocation;
	} );

	test( 'should render upgrade label', () => {
		render( <ThemeTierStyleVariationBadge /> );

		const upgradeLabel = screen.getByText( 'Upgrade' );
		expect( upgradeLabel ).toBeInTheDocument();
	} );

	test( 'should render a link to the plan on the tooltip content', async () => {
		const title = 'Explorer';
		const pathSlug = 'premium';
		getPlan.mockImplementation( () => ( {
			getTitle: () => title,
			getPathSlug: () => pathSlug,
		} ) );

		render( <ThemeTierStyleVariationBadge /> );

		userEvent.hover( screen.getByText( 'Upgrade' ) );

		const button = await screen.findByRole( 'button', { name: `${ title } plan` } );
		await act( async () => {
			await userEvent.click( button );
		} );

		await waitFor( () =>
			expect( global.window.location.href ).toBe(
				`/checkout/${ siteSlug }/${ pathSlug }?redirect_to=http%3A%2F%2Fwwww.example.com`
			)
		);
	} );
} );
