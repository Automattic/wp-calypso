import { fetchWpOrgPluginIcons, WPORG_ICONS_BATCH_SIZE } from '..';

const icons = ( {
	svg = false,
	icon = false,
	icon_2x = false,
	generated = false,
}: Partial< {
	svg: string | false;
	icon: string | false;
	icon_2x: string | false;
	generated: boolean;
} > ) => ( { svg, icon, icon_2x, generated } );

const mockResponse = ( body: unknown, ok = true, status = ok ? 200 : 500 ) => {
	const fetchMock = jest.fn().mockResolvedValue( {
		ok,
		status,
		json: async () => body,
	} );
	global.fetch = fetchMock as unknown as typeof global.fetch;
	return fetchMock;
};

describe( 'fetchWpOrgPluginIcons', () => {
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'maps each slug to its icon URL', async () => {
		mockResponse( [
			{ slug: 'jetpack', icons: icons( { svg: 'https://ps.w.org/jetpack/assets/icon.svg' } ) },
			{
				slug: 'akismet',
				icons: icons( {
					icon: 'https://ps.w.org/akismet/assets/icon-128x128.png',
					icon_2x: 'https://ps.w.org/akismet/assets/icon-256x256.png',
				} ),
			},
		] );

		await expect( fetchWpOrgPluginIcons( [ 'jetpack', 'akismet' ] ) ).resolves.toEqual( {
			jetpack: 'https://ps.w.org/jetpack/assets/icon.svg',
			akismet: 'https://ps.w.org/akismet/assets/icon-128x128.png',
		} );
	} );

	it( 'asks wp.org for every slug in a single request', async () => {
		const fetchMock = mockResponse( [] );

		await fetchWpOrgPluginIcons( [ 'jetpack', 'akismet' ] );

		expect( fetchMock ).toHaveBeenCalledTimes( 1 );
		const url = new URL( fetchMock.mock.calls[ 0 ][ 0 ] as string );
		expect( url.origin + url.pathname ).toBe(
			'https://wordpress.org/plugins/wp-json/wp/v2/plugin'
		);
		expect( url.searchParams.getAll( 'slug[]' ) ).toEqual( [ 'jetpack', 'akismet' ] );
		expect( url.searchParams.get( '_fields' ) ).toBe( 'slug,icons' );
	} );

	it( 'omits plugins wp.org only has a generated pattern for', async () => {
		mockResponse( [
			{
				slug: 'classic-widgets',
				icons: icons( {
					icon: 'https://s.w.org/plugins/geopattern-icon/classic-widgets.svg',
					generated: true,
				} ),
			},
		] );

		await expect( fetchWpOrgPluginIcons( [ 'classic-widgets' ] ) ).resolves.toEqual( {} );
	} );

	it( 'omits slugs wp.org does not recognise', async () => {
		mockResponse( [] );

		await expect( fetchWpOrgPluginIcons( [ 'a-premium-plugin' ] ) ).resolves.toEqual( {} );
	} );

	// Resolving empty here would be cached as "these plugins have no icon" and
	// never retried, turning one bad response into a permanent placeholder.
	it( 'rejects when wp.org fails', async () => {
		mockResponse( null, false );

		await expect( fetchWpOrgPluginIcons( [ 'jetpack' ] ) ).rejects.toThrow( /responded/ );
	} );

	// Without a numeric `status` the shared retry predicate cannot tell a 429
	// from a network blip, and retries it three more times for every slug.
	it( 'carries the HTTP status so a client error is not retried', async () => {
		mockResponse( null, false, 429 );

		await expect( fetchWpOrgPluginIcons( [ 'jetpack' ] ) ).rejects.toMatchObject( {
			status: 429,
			statusCode: 429,
		} );
	} );

	it( 'does not resolve a slug that collides with an Object prototype key', async () => {
		mockResponse( [] );

		const icons = await fetchWpOrgPluginIcons( [ 'constructor' ] );

		expect( icons.constructor ).toBeUndefined();
	} );

	it( 'rejects when a 200 carries something other than the collection', async () => {
		mockResponse( { code: 'rest_forbidden' } );

		await expect( fetchWpOrgPluginIcons( [ 'jetpack' ] ) ).rejects.toThrow( /unexpected body/ );
	} );

	it( 'rejects rather than silently truncating past the batch size', async () => {
		const fetchMock = mockResponse( [] );
		const slugs = Array.from( { length: WPORG_ICONS_BATCH_SIZE + 1 }, ( _, i ) => `plugin-${ i }` );

		await expect( fetchWpOrgPluginIcons( slugs ) ).rejects.toThrow( /at most/ );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );

	it( 'makes no request when there are no slugs', async () => {
		const fetchMock = mockResponse( [] );

		await expect( fetchWpOrgPluginIcons( [] ) ).resolves.toEqual( {} );
		expect( fetchMock ).not.toHaveBeenCalled();
	} );
} );
