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
import { mastodonProfile, mastodonTagFeed, mastodonThread } from '../controller';

function makeContext( params: Record< string, string > ) {
	return { params, primary: null } as unknown as Parameters< typeof mastodonProfile >[ 0 ];
}

beforeEach( () => {
	mockNext.mockReset();
	jest.mocked( page.redirect ).mockReset();
} );

describe( 'mastodonProfile controller', () => {
	it( 'sets context.primary and calls next on a numeric id', () => {
		const ctx = makeContext( { id: '7', actor: '108020' } );
		mastodonProfile( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'sets context.primary and calls next on a webfinger handle', () => {
		const ctx = makeContext( { id: '7', actor: '@alice@mastodon.social' } );
		mastodonProfile( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to /reader/mastodon when id is non-finite', () => {
		const ctx = makeContext( { id: 'NaN', actor: '108020' } );
		mastodonProfile( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/mastodon' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader/mastodon/:id on empty actor', () => {
		const ctx = makeContext( { id: '7', actor: '' } );
		mastodonProfile( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/mastodon/7' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects on path-traversal in actor', () => {
		const ctx = makeContext( { id: '7', actor: '../../foo' } );
		mastodonProfile( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/mastodon/7' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects on actor with control characters', () => {
		const ctx = makeContext( { id: '7', actor: 'has spaces' } );
		mastodonProfile( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/mastodon/7' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );
} );

describe( 'mastodonThread controller', () => {
	it( 'sets context.primary on a valid status_id', () => {
		const ctx = makeContext( { id: '7', status_id: '108020' } );
		mastodonThread( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to /reader/mastodon when id is non-finite', () => {
		const ctx = makeContext( { id: 'NaN', status_id: '108020' } );
		mastodonThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/mastodon' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader/mastodon/:id on a non-numeric status_id', () => {
		const ctx = makeContext( { id: '7', status_id: 'abc' } );
		mastodonThread( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/mastodon/7' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );
} );

describe( 'mastodonTagFeed controller', () => {
	it( 'sets context.primary on a valid id + hashtag', () => {
		const ctx = makeContext( { id: '7', hashtag: 'rust' } );
		mastodonTagFeed( ctx, mockNext );
		expect( ctx.primary ).not.toBeNull();
		expect( mockNext ).toHaveBeenCalled();
	} );

	it( 'redirects to /reader/mastodon when id is non-finite', () => {
		const ctx = makeContext( { id: 'NaN', hashtag: 'rust' } );
		mastodonTagFeed( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/mastodon' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'redirects to /reader/mastodon/:id on a malformed hashtag', () => {
		const ctx = makeContext( { id: '7', hashtag: 'has spaces' } );
		mastodonTagFeed( ctx, mockNext );
		expect( page.redirect ).toHaveBeenCalledWith( '/reader/mastodon/7' );
		expect( mockNext ).not.toHaveBeenCalled();
	} );

	it( 'lowercases the hashtag before passing it to the view', () => {
		const ctx = makeContext( { id: '7', hashtag: 'Rust' } );
		mastodonTagFeed( ctx, mockNext );
		expect( ( ctx.primary as unknown as { props: { hashtag: string } } ).props.hashtag ).toBe(
			'rust'
		);
	} );
} );
