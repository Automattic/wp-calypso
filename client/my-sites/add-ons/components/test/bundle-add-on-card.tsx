/** @jest-environment jsdom */
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import wpcomRequest from 'wpcom-proxy-request';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { POLL_INTERVAL_MS } from '../../hooks/use-bundle-plugin-install';
import BundleAddOnCard from '../bundle-add-on-card';
import type { PluginAddOnMeta } from '@automattic/data-stores';

jest.mock( 'wpcom-proxy-request', () => jest.fn() );
jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );
jest.mock( '@automattic/data-stores/src/add-ons', () => ( {
	...jest.requireActual( '@automattic/data-stores/src/add-ons' ),
	useAddOnPurchaseStatus: jest.fn( () => ( {
		available: false,
		reason: 'included',
		text: 'Included in your plan',
	} ) ),
} ) );

const SITE_ID = 123;

const addOnMeta: PluginAddOnMeta = {
	addOnSlug: 'woocommerce-bookings-add-on',
	pluginSlug: 'woocommerce-bookings',
	featureSlugs: [ 'woo-bundle-extensions' ],
	name: 'WooCommerce Bookings',
	description: 'Let customers book appointments.',
};

const corePlugin = ( status: 'active' | 'inactive' ) => ( {
	plugin: 'woocommerce-bookings/woocommerce-bookings',
	status,
	name: 'WooCommerce Bookings',
} );

/**
 * Mocks the two requests the card makes. Each plugins request takes the next entry of
 * `pluginResponses`, and the last entry repeats.
 */
const mockRequests = ( {
	pluginResponses,
	install = () => Promise.resolve( { status: 'installed', slug: 'woocommerce-bookings' } ),
}: {
	pluginResponses: unknown[][];
	install?: () => Promise< unknown >;
} ) => {
	( wpcomRequest as jest.Mock ).mockImplementation( ( params: { method?: string } ) => {
		if ( params.method === 'POST' ) {
			return install();
		}
		const response =
			pluginResponses.length > 1 ? pluginResponses.shift() : pluginResponses[ 0 ];
		return Promise.resolve( response );
	} );
};

const installRequests = () =>
	( wpcomRequest as jest.Mock ).mock.calls.filter( ( [ params ] ) => params.method === 'POST' );

const renderCard = () =>
	renderWithProvider(
		<BundleAddOnCard addOnMeta={ addOnMeta } siteId={ SITE_ID } highlightFeatured />
	);

describe( 'BundleAddOnCard', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'shows the plan inclusion and no price or "Buy add-on" button', async () => {
		mockRequests( { pluginResponses: [ [] ] } );

		renderCard();

		expect( await screen.findByRole( 'button', { name: 'Install' } ) ).toBeInTheDocument();
		expect( screen.getByText( 'Included in your plan' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Buy add-on' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /\/month/ ) ).not.toBeInTheDocument();
	} );

	it( 'sends one install request for the plugin slug and records the click', async () => {
		mockRequests( { pluginResponses: [ [] ] } );

		renderCard();
		await userEvent.click( await screen.findByRole( 'button', { name: 'Install' } ) );

		await waitFor( () => expect( installRequests() ).toHaveLength( 1 ) );
		expect( installRequests()[ 0 ][ 0 ] ).toEqual( {
			path: `/sites/${ SITE_ID }/woo-bundle-extensions/woocommerce-bookings`,
			apiNamespace: 'wpcom/v2',
			method: 'POST',
		} );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_add_ons_bundle_install_click', {
			plugin_slug: 'woocommerce-bookings',
		} );
	} );

	it( 'shows "Installed" after an `installed` response', async () => {
		mockRequests( { pluginResponses: [ [ corePlugin( 'inactive' ) ] ] } );

		renderCard();
		await userEvent.click( await screen.findByRole( 'button', { name: 'Install' } ) );

		expect( await screen.findByText( 'Installed' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Install' } ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the spinner after an `in_progress` response until the plugin is active', async () => {
		jest.useFakeTimers();
		mockRequests( {
			// The first load, the refetch when the install request ends, then the first poll.
			pluginResponses: [
				[ corePlugin( 'inactive' ) ],
				[ corePlugin( 'inactive' ) ],
				[ corePlugin( 'active' ) ],
			],
			install: () => Promise.resolve( { status: 'in_progress', slug: 'woocommerce-bookings' } ),
		} );

		const user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		const { container } = renderCard();
		await user.click( await screen.findByRole( 'button', { name: 'Install' } ) );

		// Wait for the first load, the install request and the refetch.
		await waitFor( () => expect( wpcomRequest ).toHaveBeenCalledTimes( 3 ) );
		await waitFor( () =>
			expect( screen.queryByRole( 'button', { name: 'Install' } ) ).not.toBeInTheDocument()
		);
		expect( container.querySelector( '.spinner' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Installed' ) ).not.toBeInTheDocument();

		act( () => {
			jest.advanceTimersByTime( POLL_INTERVAL_MS );
		} );

		expect( await screen.findByText( 'Installed' ) ).toBeInTheDocument();
		expect( container.querySelector( '.spinner' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the error message and the button again after a 403 response', async () => {
		mockRequests( {
			pluginResponses: [ [] ],
			install: () =>
				Promise.reject( {
					statusCode: 403,
					error: 'woo_bundle_not_available',
					message: 'This extension is not available for this site.',
				} ),
		} );

		const { container } = renderCard();
		await userEvent.click( await screen.findByRole( 'button', { name: 'Install' } ) );

		// Query the notice itself: the notice also announces its message in a live region.
		await waitFor( () =>
			expect( container.querySelector( '.components-notice' ) ).toHaveTextContent(
				'This extension is not available for this site.'
			)
		);
		expect( screen.getByRole( 'button', { name: 'Install' } ) ).toBeInTheDocument();
	} );
} );
