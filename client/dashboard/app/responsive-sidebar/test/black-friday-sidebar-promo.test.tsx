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
	const config = Object.assign(
		( key: string ) => ( key === 'wpcom_url' ? 'https://wordpress.com' : undefined ),
		{
			isEnabled: ( key: string ) => key === 'black-friday-2026' && state.flag,
		}
	);
	return { state, config };
} );

vi.mock( '@automattic/calypso-config', () => ( {
	default: mockConfig.config,
	...mockConfig.config,
} ) );

const mockExplat = vi.hoisted( () => ( {
	state: { isLoading: false, variation: null as string | null },
} ) );

vi.mock( 'calypso/lib/explat', () => ( {
	useExperiment: ( _name: string, options?: { isEligible?: boolean } ) =>
		options?.isEligible === false
			? [ false, null ]
			: [
					mockExplat.state.isLoading,
					mockExplat.state.isLoading ? null : { variationName: mockExplat.state.variation },
				],
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
		mockExplat.state = { isLoading: false, variation: null };
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

	test( 'shows the lifecycle offer to the treatment group', () => {
		mockExplat.state.variation = 'treatment';
		vi.setSystemTime( insideSale );
		renderPromo();

		const link = screen.getByRole( 'link', { name: /30% off annual plans/ } );
		expect( link ).toHaveAttribute(
			'href',
			expect.stringContaining( '/plans?coupon=BF30WPCOM2026' )
		);
		expect(
			screen.getByText( 'Upgrade today and pay 30% less for your first year.' )
		).toBeVisible();
		expect( screen.getByText( 'Get 30% off' ) ).toBeVisible();
		expect( screen.queryByText( /25%/ ) ).not.toBeInTheDocument();
	} );

	test( 'shows the public offer to the control group', () => {
		mockExplat.state.variation = 'control';
		vi.setSystemTime( insideSale );
		renderPromo();

		const link = screen.getByRole( 'link', { name: /25% off annual and multi-year plans/ } );
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/black-friday-2026/' );
		expect( screen.queryByText( /30%/ ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing while the assignment loads', () => {
		mockExplat.state = { isLoading: true, variation: null };
		vi.setSystemTime( insideSale );
		renderPromo();

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );

	test( 'renders nothing for the treatment group outside the sale', () => {
		mockExplat.state.variation = 'treatment';
		vi.setSystemTime( afterSale );
		renderPromo();

		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );
} );
