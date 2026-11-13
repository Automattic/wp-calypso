/**
 * @vitest-environment jsdom
 */
import config from '@automattic/calypso-config';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import AddNewSite from '../index';

vi.mock( '@automattic/calypso-config', async ( importActual ) => {
	const { default: actual } = await importActual< typeof import( '@automattic/calypso-config' ) >();
	const mockConfig = vi.fn( ( key: string ) => ( key === 'env' ? 'production' : actual( key ) ) );
	return { __esModule: true, default: Object.assign( mockConfig, actual, { isEnabled: vi.fn() } ) };
} );

describe( '<AddNewSite>', () => {
	beforeEach( () => {
		vi.mocked( config.isEnabled ).mockImplementation( ( flag ) => flag === 'black-friday-2026' );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	test( 'shows the Black Friday offer with the coupon during the sale', async () => {
		vi.useFakeTimers( { toFake: [ 'Date' ] } );
		vi.setSystemTime( Date.UTC( 2026, 10, 28, 12 ) );

		render( <AddNewSite context="sites-dashboard" /> );

		expect( await screen.findByText( 'Black Friday: 25% off annual plans' ) ).toBeVisible();
		expect(
			screen.getByText( 'Upgrade today and pay 25% less for your first year.' )
		).toBeVisible();
		const cta = screen.getByRole( 'link', { name: 'Get 25% off' } );
		expect( cta ).toHaveAttribute( 'href', expect.stringContaining( '/setup/onboarding' ) );
		expect( cta ).toHaveAttribute( 'href', expect.stringContaining( 'coupon=BFWPCOM2026' ) );
		expect( screen.queryByRole( 'link', { name: 'Unlock offer' } ) ).not.toBeInTheDocument();
	} );

	test( 'records the Black Friday and the existing offer click events', async () => {
		vi.useFakeTimers( { toFake: [ 'Date' ] } );
		vi.setSystemTime( Date.UTC( 2026, 10, 28, 12 ) );

		const { recordTracksEvent } = render( <AddNewSite context="sites-dashboard" /> );

		const cta = await screen.findByRole( 'link', { name: 'Get 25% off' } );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_bf2026_add_site_promo_view' );

		cta.addEventListener( 'click', ( event ) => event.preventDefault() );
		await userEvent.click( cta );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_bf2026_add_site_promo_click' );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_sites_new_site_action_click_item',
			{ action: 'offer' }
		);
	} );

	test( 'shows the regular offer outside the sale', async () => {
		vi.useFakeTimers( { toFake: [ 'Date' ] } );
		vi.setSystemTime( Date.UTC( 2026, 10, 20, 12 ) );

		render( <AddNewSite context="sites-dashboard" /> );

		const cta = await screen.findByRole( 'link', { name: 'Unlock offer' } );
		expect( cta ).not.toHaveAttribute( 'href', expect.stringContaining( 'coupon=' ) );
		expect( screen.queryByText( 'Black Friday: 25% off annual plans' ) ).not.toBeInTheDocument();
	} );

	test( 'shows the regular offer during the sale when the flag is off', async () => {
		vi.mocked( config.isEnabled ).mockReturnValue( false );
		vi.useFakeTimers( { toFake: [ 'Date' ] } );
		vi.setSystemTime( Date.UTC( 2026, 10, 28, 12 ) );

		render( <AddNewSite context="sites-dashboard" /> );

		expect( await screen.findByRole( 'link', { name: 'Unlock offer' } ) ).toBeVisible();
		expect( screen.queryByText( 'Black Friday: 25% off annual plans' ) ).not.toBeInTheDocument();
	} );
} );
