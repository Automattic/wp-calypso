/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { BlackFridaySidebarPromo } from '../black-friday-sidebar-promo';
import type { AgencySupports } from '../../context';

const mockConfig = vi.hoisted( () => {
	const state = { flag: true, env: 'production' };
	const config = Object.assign( ( key: string ) => ( key === 'env' ? state.env : undefined ), {
		isEnabled: ( key: string ) => key === 'black-friday-2026' && state.flag,
	} );
	return { state, config };
} );

vi.mock( '@automattic/calypso-config', () => ( {
	default: mockConfig.config,
	...mockConfig.config,
} ) );

const insideSale = Date.UTC( 2026, 10, 28, 12 );
const beforeSale = Date.UTC( 2026, 10, 26, 23, 59, 59 );
const afterSale = Date.UTC( 2026, 11, 2 );

function renderPromo( { agency = false }: { agency?: boolean } = {} ) {
	const agencySupports: false | AgencySupports = agency ? ( {} as AgencySupports ) : false;
	const config = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, agency: agencySupports },
	};
	render(
		<AppProvider config={ config }>
			<BlackFridaySidebarPromo />
		</AppProvider>
	);
}

describe( '<BlackFridaySidebarPromo>', () => {
	beforeEach( () => {
		mockConfig.state.flag = true;
		mockConfig.state.env = 'production';
		vi.useFakeTimers( { toFake: [ 'Date' ] } );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	test( 'shows the offer and links to the landing page during the sale', () => {
		vi.setSystemTime( insideSale );
		renderPromo();

		const link = screen.getByRole( 'link', { name: /Black Friday: 25% off annual plans/ } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/black-friday-2026/' );
		expect(
			screen.getByText( 'Upgrade today and pay 25% less for your first year.' )
		).toBeVisible();
		expect( screen.getByText( 'Get 25% off' ) ).toBeVisible();
	} );

	test.each( [
		[ 'before', beforeSale ],
		[ 'after', afterSale ],
	] )( 'renders nothing %s the sale', ( _label, now ) => {
		vi.setSystemTime( now );
		renderPromo();

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing inside the sale when the flag is off', () => {
		mockConfig.state.flag = false;
		vi.setSystemTime( insideSale );
		renderPromo();

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'shows outside the sale in development when the flag is on', () => {
		mockConfig.state.env = 'development';
		vi.setSystemTime( beforeSale );
		renderPromo();

		expect(
			screen.getByRole( 'link', { name: /Black Friday: 25% off annual plans/ } )
		).toBeVisible();
	} );

	test( 'renders nothing for agencies during the sale', () => {
		vi.setSystemTime( insideSale );
		renderPromo( { agency: true } );

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );
} );
