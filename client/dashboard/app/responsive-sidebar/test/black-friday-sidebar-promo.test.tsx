/**
 * @vitest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../context';
import { BlackFridaySidebarPromo } from '../black-friday-sidebar-promo';
import type { AgencyClientSupports, AgencySupports } from '../../context';

const mockConfig = vi.hoisted( () => {
	const state = { flag: false };
	const config = Object.assign( () => undefined, {
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

function renderPromo( {
	agency = false,
	agencyClient = false,
}: { agency?: boolean; agencyClient?: boolean } = {} ) {
	const agencySupports: false | AgencySupports = agency ? ( {} as AgencySupports ) : false;
	const agencyClientSupports: false | AgencyClientSupports = agencyClient
		? ( {} as AgencyClientSupports )
		: false;
	const config = {
		...APP_CONTEXT_DEFAULT_CONFIG,
		supports: {
			...APP_CONTEXT_DEFAULT_CONFIG.supports,
			agency: agencySupports,
			agencyClient: agencyClientSupports,
		},
	};
	render(
		<AppProvider config={ config }>
			<BlackFridaySidebarPromo />
		</AppProvider>
	);
}

describe( '<BlackFridaySidebarPromo>', () => {
	beforeEach( () => {
		mockConfig.state.flag = false;
		vi.useFakeTimers( { toFake: [ 'Date' ] } );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	test( 'shows the offer and links to the landing page during the sale', () => {
		vi.setSystemTime( insideSale );
		renderPromo();

		const link = screen.getByRole( 'link', { name: /25% off annual and multi-year plans/ } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/black-friday-2026/' );
		expect(
			screen.getByText( 'That’s up to 66% less than paying monthly. Sale ends December 1.' )
		).toBeVisible();
		expect( link.querySelector( 'svg.bf2026-artwork' ) ).toBeInTheDocument();
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

	test( 'shows outside the sale when the flag is on', () => {
		mockConfig.state.flag = true;
		vi.setSystemTime( beforeSale );
		renderPromo();

		expect(
			screen.getByRole( 'link', { name: /25% off annual and multi-year plans/ } )
		).toBeVisible();
	} );

	test.each( [ { agency: true }, { agencyClient: true } ] )(
		'renders nothing for agency dashboards during the sale (%o)',
		( supports ) => {
			vi.setSystemTime( insideSale );
			renderPromo( supports );

			expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		}
	);
} );
