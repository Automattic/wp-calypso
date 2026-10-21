import { AI_SITE_BUILDER_FLOW } from '@automattic/onboarding';
import wpcom from 'calypso/lib/wp';
import {
	getAtomicProvisionedSiteSlug,
	getEarlyCreatedSiteId,
	pollForAtomicProvisioning,
} from '../early-provisioning';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: jest.fn() } },
} ) );

const wpcomGetMock = wpcom.req.get as jest.Mock;

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'getEarlyCreatedSiteId', () => {
	it( 'allows WPCOM Atomic provisioning to happen during regular site creation', () => {
		expect( getEarlyCreatedSiteId( AI_SITE_BUILDER_FLOW, null ) ).toBeNull();
	} );

	it( 'returns the early-created site ID for WPCOM Atomic early provisioning', () => {
		expect( getEarlyCreatedSiteId( AI_SITE_BUILDER_FLOW, '255716498' ) ).toBe( 255716498 );
	} );

	it( 'allows regular AI Site Builder creation when WPCOM Atomic early provisioning is not requested', () => {
		expect( getEarlyCreatedSiteId( AI_SITE_BUILDER_FLOW, null ) ).toBeNull();
	} );
} );

describe( 'getAtomicProvisionedSiteSlug', () => {
	it( 'prefers the site slug from the provisioning response', () => {
		expect(
			getAtomicProvisionedSiteSlug(
				{
					URL: 'https://fallback.wordpress.com',
					slug: 'provisioned.wordpress.com',
				},
				123
			)
		).toBe( 'provisioned.wordpress.com' );
	} );

	it( 'falls back to the host from the site URL', () => {
		expect(
			getAtomicProvisionedSiteSlug(
				{
					URL: 'https://provisioned.wordpress.com',
				},
				123
			)
		).toBe( 'provisioned.wordpress.com' );
	} );

	it( 'falls back to the site ID when the response has no usable slug', () => {
		expect(
			getAtomicProvisionedSiteSlug(
				{
					URL: 'not a url',
				},
				123
			)
		).toBe( '123' );
	} );
} );

describe( 'pollForAtomicProvisioning', () => {
	it( 'returns the real site slug once the site is WPCOM Atomic', async () => {
		wpcomGetMock.mockResolvedValue( {
			is_wpcom_atomic: true,
			slug: 'provisioned.wordpress.com',
		} );

		await expect( pollForAtomicProvisioning( 123, 1, 0 ) ).resolves.toEqual( {
			siteSlug: 'provisioned.wordpress.com',
		} );
		expect( wpcomGetMock ).toHaveBeenCalledWith(
			{
				path: '/sites/123',
				apiVersion: '1.1',
			},
			{
				fields: 'ID,URL,slug,is_wpcom_atomic,options',
				options: 'is_wpcom_atomic',
			}
		);
	} );

	it( 'accepts the options.is_wpcom_atomic response shape', async () => {
		wpcomGetMock.mockResolvedValue( {
			URL: 'https://atomic-site.wordpress.com',
			options: {
				is_wpcom_atomic: true,
			},
		} );

		await expect( pollForAtomicProvisioning( 123, 1, 0 ) ).resolves.toEqual( {
			siteSlug: 'atomic-site.wordpress.com',
		} );
	} );

	it( 'keeps polling until the site becomes WPCOM Atomic', async () => {
		wpcomGetMock
			.mockResolvedValueOnce( {
				is_wpcom_atomic: false,
			} )
			.mockResolvedValueOnce( {
				is_wpcom_atomic: true,
				slug: 'ready.wordpress.com',
			} );

		await expect( pollForAtomicProvisioning( 123, 2, 0 ) ).resolves.toEqual( {
			siteSlug: 'ready.wordpress.com',
		} );
		expect( wpcomGetMock ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'throws a timeout error when the site never becomes WPCOM Atomic', async () => {
		wpcomGetMock.mockResolvedValue( {
			is_wpcom_atomic: false,
		} );

		await expect( pollForAtomicProvisioning( 123, 2, 0 ) ).rejects.toMatchObject( {
			code: 'wpcom_atomic_provisioning_timeout',
		} );
		expect( wpcomGetMock ).toHaveBeenCalledTimes( 2 );
	} );
} );
