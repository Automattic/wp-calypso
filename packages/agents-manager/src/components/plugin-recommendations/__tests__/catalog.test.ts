import wpcomRequest from 'wpcom-proxy-request';
import { fetchRecommendation } from '../catalog';

jest.mock( 'wpcom-proxy-request', () => ( { __esModule: true, default: jest.fn() } ) );
const originalFetch = globalThis.fetch;
const fetchMock = jest.fn();
beforeEach( () => {
	jest.clearAllMocks();
	globalThis.fetch = fetchMock;
} );
afterAll( () => {
	globalThis.fetch = originalFetch;
} );

it( 'hydrates wp.org without requesting the commercial catalog', async () => {
	fetchMock.mockResolvedValue( { ok: true, json: async () => ( { name: 'SEO' } ) } );
	await expect( fetchRecommendation( { slug: 'seo' }, 'en' ) ).resolves.toEqual( { name: 'SEO' } );
	expect( wpcomRequest ).not.toHaveBeenCalled();
} );
it( 'queries commercial picks directly', async () => {
	jest.mocked( wpcomRequest ).mockResolvedValue( { name: 'Premium' } );
	await expect(
		fetchRecommendation( { slug: 'premium', source: 'commercial' }, 'en' )
	).resolves.toEqual( { name: 'Premium' } );
	expect( fetchMock ).not.toHaveBeenCalled();
} );
it( 'falls back for unknown sources and retains unresolved results', async () => {
	fetchMock.mockResolvedValue( { ok: true, json: async () => ( { error: 'Not found' } ) } );
	jest.mocked( wpcomRequest ).mockResolvedValue( {} );
	await expect( fetchRecommendation( { slug: 'missing' }, 'en' ) ).resolves.toBeNull();
	expect( wpcomRequest ).toHaveBeenCalledWith( {
		path: '/marketplace/products/missing',
		apiNamespace: 'wpcom/v2',
	} );
} );
it( 'does not cross catalogs for explicit wp.org picks and exposes network errors', async () => {
	fetchMock.mockRejectedValue( new Error( 'Offline' ) );
	await expect( fetchRecommendation( { slug: 'seo', source: 'wporg' }, 'en' ) ).rejects.toThrow(
		'Offline'
	);
	expect( wpcomRequest ).not.toHaveBeenCalled();
} );
