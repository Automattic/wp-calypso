/**
 * @jest-environment jsdom
 */

const mockNext = jest.fn();

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: jest.fn() },
} ) );

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn().mockReturnValue( true ),
} ) );

import page from '@automattic/calypso-router';
import { atmosphereProfile, atmosphereTagFeed, atmosphereThread } from '../controller';

const validDid = 'did:plc:abc234567defghi234567jkl';
const validRkey = '3kabcdefghijk';

function makeContext( params: Record< string, string > ) {
	return { params, primary: null } as unknown as Parameters< typeof atmosphereThread >[ 0 ];
}

beforeEach( () => {
	mockNext.mockReset();
	jest.mocked( page.redirect ).mockReset();
} );

describe( 'atmosphereThread controller', () => {
	it( 'sets context.primary and calls next on valid input', () => {
		const ctx = makeContext( { id: '7', did: validDid, rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere when id is non-finite', () => {
		const ctx = makeContext( { id: 'NaN', did: validDid, rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere/:id on invalid did', () => {
		const ctx = makeContext( { id: '7', did: 'did:bad:UPPERCASE', rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere/7' );
	} );

	it( 'redirects on did:web inputs that aren’t hostname-shaped', () => {
		const ctx = makeContext( { id: '7', did: 'did:web:.', rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere/7' );
	} );

	it( 'accepts a valid did:web', () => {
		const ctx = makeContext( { id: '7', did: 'did:web:example.com', rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere/:id on invalid rkey', () => {
		const ctx = makeContext( { id: '7', did: validDid, rkey: 'BAD' } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere/7' );
	} );

	it( 'redirects to /reader when feature flag is off', () => {
		const config = jest.requireMock( '@automattic/calypso-config' ) as {
			isEnabled: jest.Mock;
		};
		config.isEnabled.mockReturnValueOnce( false );
		const ctx = makeContext( { id: '7', did: validDid, rkey: validRkey } );
		atmosphereThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );
} );

describe( 'atmosphereProfile', () => {
	function makeProfileContext( params: Record< string, string > ) {
		return { params, primary: null } as unknown as Parameters< typeof atmosphereProfile >[ 0 ];
	}

	it( 'mounts the AsyncLoad shell on a valid id + handle actor', () => {
		const ctx = makeProfileContext( { id: '42', actor: 'alice.bsky.social' } );
		atmosphereProfile( ctx, mockNext );
		expect( ctx.primary ).toBeTruthy();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'mounts on a valid did:plc: actor', () => {
		const ctx = makeProfileContext( {
			id: '42',
			actor: validDid,
		} );
		atmosphereProfile( ctx, mockNext );
		expect( ctx.primary ).toBeTruthy();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'mounts on a valid did:web: actor', () => {
		const ctx = makeProfileContext( { id: '42', actor: 'did:web:example.com' } );
		atmosphereProfile( ctx, mockNext );
		expect( ctx.primary ).toBeTruthy();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to the connection root on an invalid actor', () => {
		const ctx = makeProfileContext( { id: '42', actor: 'BAD UPPERCASE' } );
		atmosphereProfile( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere/42' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere on a non-numeric id', () => {
		const ctx = makeProfileContext( { id: 'NaN', actor: 'alice.bsky.social' } );
		atmosphereProfile( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere when both id and actor are bad', () => {
		const ctx = makeProfileContext( { id: '0', actor: 'bad' } );
		atmosphereProfile( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader when the feature flag is off', () => {
		const config = jest.requireMock( '@automattic/calypso-config' ) as {
			isEnabled: jest.Mock;
		};
		config.isEnabled.mockReturnValueOnce( false );
		const ctx = makeProfileContext( { id: '42', actor: 'alice.bsky.social' } );
		atmosphereProfile( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );
} );

describe( 'atmosphereTagFeed', () => {
	function makeTagContext( params: Record< string, string > ) {
		return { params, primary: null } as unknown as Parameters< typeof atmosphereTagFeed >[ 0 ];
	}

	it( 'mounts the AsyncLoad shell on a valid id + hashtag', () => {
		const ctx = makeTagContext( { id: '42', hashtag: 'rust' } );
		atmosphereTagFeed( ctx, mockNext );
		expect( ctx.primary ).toBeTruthy();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'lowercases the hashtag before passing it to the view', () => {
		const ctx = makeTagContext( { id: '42', hashtag: 'Rust' } );
		atmosphereTagFeed( ctx, mockNext );
		const primary = ctx.primary as unknown as { props: { hashtag: string } };
		expect( primary.props.hashtag ).toBe( 'rust' );
	} );

	it( 'strips a leading # before passing it to the view', () => {
		const ctx = makeTagContext( { id: '42', hashtag: '#rust' } );
		atmosphereTagFeed( ctx, mockNext );
		const primary = ctx.primary as unknown as { props: { hashtag: string } };
		expect( primary.props.hashtag ).toBe( 'rust' );
	} );

	it( 'accepts a Unicode hashtag', () => {
		const ctx = makeTagContext( { id: '42', hashtag: '日本語' } );
		atmosphereTagFeed( ctx, mockNext );
		expect( ctx.primary ).toBeTruthy();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to the connection root on an invalid hashtag', () => {
		const ctx = makeTagContext( { id: '42', hashtag: 'tag-with-hyphen' } );
		atmosphereTagFeed( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere/42' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader/atmosphere on a non-numeric id', () => {
		const ctx = makeTagContext( { id: 'NaN', hashtag: 'rust' } );
		atmosphereTagFeed( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/atmosphere' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader when the feature flag is off', () => {
		const config = jest.requireMock( '@automattic/calypso-config' ) as {
			isEnabled: jest.Mock;
		};
		config.isEnabled.mockReturnValueOnce( false );
		const ctx = makeTagContext( { id: '42', hashtag: 'rust' } );
		atmosphereTagFeed( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );
} );
