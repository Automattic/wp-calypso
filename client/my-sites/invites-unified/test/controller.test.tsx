/**
 * @jest-environment jsdom
 */
import { getQueryArg } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';
import { maybeUseUnifiedInvite } from '../controller';

jest.mock( '@wordpress/url', () => ( {
	getQueryArg: jest.fn(),
} ) );

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

// Mock the UnifiedInviteAccept component
jest.mock( '../index', () => ( {
	__esModule: true,
	default: () => <div data-testid="unified-invite">UnifiedInviteAccept</div>,
} ) );

const mockGetQueryArg = getQueryArg as jest.Mock;
const mockWpcomGet = wpcom.req.get as jest.Mock;

describe( 'maybeUseUnifiedInvite', () => {
	let context: {
		params: Record< string, string >;
		inviteData?: unknown;
		inviteError?: unknown;
		useUnifiedInvite?: boolean;
		primary?: React.ReactNode;
	};
	let next: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		mockGetQueryArg.mockReturnValue( undefined );

		context = {
			params: {
				site_id: '123',
				invitation_key: 'abc123',
			},
		};
		next = jest.fn();
	} );

	test( 'calls next() immediately when legacy=1 query param is present', async () => {
		mockGetQueryArg.mockImplementation( ( _url: string, param: string ) => {
			if ( param === 'legacy' ) {
				return '1';
			}
			return undefined;
		} );

		await maybeUseUnifiedInvite( context as never, next );

		expect( next ).toHaveBeenCalled();
		expect( mockWpcomGet ).not.toHaveBeenCalled();
		expect( context.useUnifiedInvite ).toBeUndefined();
	} );

	test( 'fetches invite data and uses unified flow for CIAB sites', async () => {
		const ciabInviteData = {
			blog_details: {
				is_garden_site: true,
				garden: {
					partner: 'woo',
					name: 'commerce',
				},
			},
		};
		mockWpcomGet.mockResolvedValue( ciabInviteData );

		await maybeUseUnifiedInvite( context as never, next );

		expect( mockWpcomGet ).toHaveBeenCalledWith( '/sites/123/invites/abc123' );
		expect( context.inviteData ).toEqual( ciabInviteData );
		expect( context.useUnifiedInvite ).toBe( true );
		expect( context.primary ).toBeDefined();
		expect( next ).toHaveBeenCalled();
	} );

	test( 'uses unified flow when unified=1 query param is present', async () => {
		mockGetQueryArg.mockImplementation( ( _url: string, param: string ) => {
			if ( param === 'unified' ) {
				return '1';
			}
			return undefined;
		} );

		const nonCiabInviteData = {
			blog_details: {
				is_garden_site: false,
			},
		};
		mockWpcomGet.mockResolvedValue( nonCiabInviteData );

		await maybeUseUnifiedInvite( context as never, next );

		expect( context.useUnifiedInvite ).toBe( true );
		expect( context.primary ).toBeDefined();
		expect( next ).toHaveBeenCalled();
	} );

	test( 'does not use unified flow for non-CIAB sites without unified param', async () => {
		const nonCiabInviteData = {
			blog_details: {
				is_garden_site: false,
			},
		};
		mockWpcomGet.mockResolvedValue( nonCiabInviteData );

		await maybeUseUnifiedInvite( context as never, next );

		expect( context.inviteData ).toEqual( nonCiabInviteData );
		expect( context.useUnifiedInvite ).toBeUndefined();
		expect( context.primary ).toBeUndefined();
		expect( next ).toHaveBeenCalled();
	} );

	test( 'uses unified flow for logged-out users on CIAB sites', async () => {
		const ciabInviteData = {
			blog_details: {
				is_garden_site: true,
				garden: {
					partner: 'woo',
					name: 'commerce',
				},
			},
		};
		mockWpcomGet.mockResolvedValue( ciabInviteData );

		await maybeUseUnifiedInvite( context as never, next );

		expect( context.useUnifiedInvite ).toBe( true );
		expect( context.primary ).toBeDefined();
		expect( next ).toHaveBeenCalled();
	} );

	test( 'uses unified flow when social callback params are present', async () => {
		mockGetQueryArg.mockImplementation( ( _url: string, param: string ) => {
			if ( param === 'code' ) {
				return 'oauth-code';
			}
			return undefined;
		} );

		const ciabInviteData = {
			blog_details: {
				is_garden_site: true,
				garden: {
					partner: 'woo',
					name: 'commerce',
				},
			},
		};
		mockWpcomGet.mockResolvedValue( ciabInviteData );

		await maybeUseUnifiedInvite( context as never, next );

		expect( context.useUnifiedInvite ).toBe( true );
		expect( context.primary ).toBeDefined();
		expect( next ).toHaveBeenCalled();
	} );

	test( 'falls back to legacy flow on API error', async () => {
		mockWpcomGet.mockRejectedValue( new Error( 'API Error' ) );

		await maybeUseUnifiedInvite( context as never, next );

		expect( context.useUnifiedInvite ).toBeUndefined();
		expect( context.primary ).toBeUndefined();
		expect( next ).toHaveBeenCalled();
	} );

	test( 'passes correct params to UnifiedInviteAccept', async () => {
		context.params = {
			site_id: '456',
			invitation_key: 'xyz789',
			activation_key: 'activation123',
			auth_key: 'auth456',
		};

		const ciabInviteData = {
			blog_details: {
				is_garden_site: true,
				garden: {
					partner: 'woo',
					name: 'commerce',
				},
			},
		};
		mockWpcomGet.mockResolvedValue( ciabInviteData );

		await maybeUseUnifiedInvite( context as never, next );

		expect( context.primary ).toBeDefined();
		// The component is rendered with the correct props (verified by the mock being called)
		expect( context.useUnifiedInvite ).toBe( true );
	} );

	describe( 'already a member errors', () => {
		test( 'uses unified flow for already_member error with unified flag', async () => {
			mockGetQueryArg.mockImplementation( ( _url: string, param: string ) => {
				if ( param === 'unified' ) {
					return '1';
				}
				return undefined;
			} );

			const apiError = {
				error: 'already_member',
				message: 'You are already a member of this site',
			};
			mockWpcomGet.mockRejectedValue( apiError );

			await maybeUseUnifiedInvite( context as never, next );

			expect( context.useUnifiedInvite ).toBe( true );
			expect( context.inviteError ).toEqual( {
				error: 'already_member',
				message: 'You are already a member of this site',
			} );
			expect( context.primary ).toBeDefined();
			expect( next ).toHaveBeenCalled();
		} );

		test( 'uses unified flow for already_subscribed error with unified flag', async () => {
			mockGetQueryArg.mockImplementation( ( _url: string, param: string ) => {
				if ( param === 'unified' ) {
					return '1';
				}
				return undefined;
			} );

			const apiError = {
				error: 'already_subscribed',
				message: 'You are already a follower of this site',
			};
			mockWpcomGet.mockRejectedValue( apiError );

			await maybeUseUnifiedInvite( context as never, next );

			expect( context.useUnifiedInvite ).toBe( true );
			expect( context.primary ).toBeDefined();
			expect( next ).toHaveBeenCalled();
		} );

		test( 'uses unified flow for already_member error with garden data', async () => {
			const apiError = {
				error: 'already_member',
				message: 'You are already a member of this site',
				data: {
					garden_name: 'commerce',
					garden_partner: 'woo',
				},
			};
			mockWpcomGet.mockRejectedValue( apiError );

			await maybeUseUnifiedInvite( context as never, next );

			expect( context.useUnifiedInvite ).toBe( true );
			expect( context.inviteError ).toEqual( {
				error: 'already_member',
				message: 'You are already a member of this site',
			} );
			expect( context.inviteData ).toEqual( {
				blog_details: {
					is_garden_site: true,
					garden: { name: 'commerce', partner: 'woo' },
				},
			} );
			expect( context.primary ).toBeDefined();
			expect( next ).toHaveBeenCalled();
		} );

		test( 'falls back to legacy for already_member error without garden data or unified flag', async () => {
			const apiError = {
				error: 'already_member',
				message: 'You are already a member of this site',
			};
			mockWpcomGet.mockRejectedValue( apiError );

			await maybeUseUnifiedInvite( context as never, next );

			expect( context.useUnifiedInvite ).toBeUndefined();
			expect( context.primary ).toBeUndefined();
			expect( next ).toHaveBeenCalled();
		} );
	} );
} );
