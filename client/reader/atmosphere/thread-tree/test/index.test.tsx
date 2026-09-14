/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ThreadTree } from '../index';
import type { AtmosphereThreadNode, AtmosphereFeedItem } from '@automattic/api-core';

function makeFeedItem( overrides: Partial< AtmosphereFeedItem > = {} ): AtmosphereFeedItem {
	return {
		uri: 'at://did:plc:default/app.bsky.feed.post/3kdef',
		cid: 'cid-default',
		author: {
			did: 'did:plc:default',
			handle: 'default.bsky.social',
			display_name: '',
			avatar: null,
		},
		created_at: '2026-04-28T10:00:00Z',
		indexed_at: '2026-04-28T10:00:00Z',
		text: '',
		html: '',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		bluesky_url: 'https://bsky.app/profile/default.bsky.social/post/3kdef',
		...overrides,
	};
}

// jsdom doesn't implement Element.prototype.scrollIntoView. Stub it for the
// duration of each test and restore afterwards so the prototype patch doesn't
// leak across files.
let scrollIntoView: jest.Mock;
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
	Element.prototype,
	'scrollIntoView'
);
beforeEach( () => {
	scrollIntoView = jest.fn();
	Object.defineProperty( Element.prototype, 'scrollIntoView', {
		configurable: true,
		writable: true,
		value: scrollIntoView,
	} );
} );
afterEach( () => {
	if ( originalScrollIntoView ) {
		Object.defineProperty( Element.prototype, 'scrollIntoView', originalScrollIntoView );
	} else {
		// @ts-expect-error -- restore "not defined" baseline jsdom shipped with.
		delete Element.prototype.scrollIntoView;
	}
} );

describe( 'ThreadTree', () => {
	it( 'renders only the root when there is no parent and no replies', () => {
		const root: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem( { uri: 'at://root', text: 'hello' } ),
			parent: null,
			replies: [],
		};
		renderWithProvider( <ThreadTree connectionId={ 42 } root={ root } targetUri="at://root" /> );
		expect( screen.getAllByRole( 'article' ) ).toHaveLength( 1 );
		expect( scrollIntoView ).not.toHaveBeenCalled();
	} );

	it( 'flattens a 3-deep parent chain oldest-first', () => {
		const greatgrand = makeFeedItem( { uri: 'at://greatgrand', text: 'gg' } );
		const grand = makeFeedItem( { uri: 'at://grand', text: 'g' } );
		const parent = makeFeedItem( { uri: 'at://parent', text: 'p' } );
		const target = makeFeedItem( { uri: 'at://target', text: 't' } );
		const root: AtmosphereThreadNode = {
			type: 'post',
			post: target,
			parent: {
				type: 'post',
				post: parent,
				parent: {
					type: 'post',
					post: grand,
					parent: {
						type: 'post',
						post: greatgrand,
						parent: null,
						replies: [],
					},
					replies: [],
				},
				replies: [],
			},
			replies: [],
		};
		renderWithProvider( <ThreadTree connectionId={ 42 } root={ root } targetUri="at://target" /> );
		const articles = screen.getAllByRole( 'article' );
		expect( articles ).toHaveLength( 4 );
		expect( articles[ 0 ] ).toHaveTextContent( 'gg' );
		expect( articles[ 1 ] ).toHaveTextContent( 'g' );
		expect( articles[ 2 ] ).toHaveTextContent( 'p' );
		expect( articles[ 3 ] ).toHaveTextContent( 't' );
		expect( articles[ 3 ] ).toHaveAttribute( 'aria-current', 'location' );
	} );

	it( 'scrollIntoView fires on mount when there is at least one parent', () => {
		const target = makeFeedItem( { uri: 'at://target' } );
		const parent = makeFeedItem( { uri: 'at://parent' } );
		const root: AtmosphereThreadNode = {
			type: 'post',
			post: target,
			parent: { type: 'post', post: parent, parent: null, replies: [] },
			replies: [],
		};
		renderWithProvider( <ThreadTree connectionId={ 42 } root={ root } targetUri="at://target" /> );
		expect( scrollIntoView ).toHaveBeenCalledTimes( 1 );
		expect( scrollIntoView ).toHaveBeenCalledWith( {
			block: 'start',
			behavior: 'instant',
		} );
	} );

	it( 'mixes live posts and tombstones at any layer', () => {
		const root: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem( { uri: 'at://root' } ),
			parent: { type: 'not_found', uri: 'at://gone' },
			replies: [
				{
					type: 'post',
					post: makeFeedItem( { uri: 'at://reply1' } ),
					parent: null,
					replies: [],
				},
				{
					type: 'blocked',
					uri: 'at://blocked',
					author: { did: 'did:plc:blk' },
				},
			],
		};
		renderWithProvider( <ThreadTree connectionId={ 42 } root={ root } targetUri="at://root" /> );
		expect( screen.getAllByRole( 'note' ) ).toHaveLength( 2 ); // not_found + blocked
		expect( screen.getAllByRole( 'article' ) ).toHaveLength( 2 ); // root + reply1
	} );

	it( 'does not render a parent’s sibling replies above the target', () => {
		const parent = makeFeedItem( { uri: 'at://parent', text: 'parent' } );
		const target = makeFeedItem( { uri: 'at://target', text: 'target' } );
		const sibling = makeFeedItem( { uri: 'at://sibling', text: 'sibling reply' } );
		const root: AtmosphereThreadNode = {
			type: 'post',
			post: target,
			parent: {
				type: 'post',
				post: parent,
				parent: null,
				// Parent has a non-target reply. Rendering the parent row above the
				// target must NOT pull this sibling in, otherwise it appears above
				// the focused post and duplicates parts of the descendant tree.
				replies: [
					{
						type: 'post',
						post: sibling,
						parent: null,
						replies: [],
					},
				],
			},
			replies: [],
		};
		renderWithProvider( <ThreadTree connectionId={ 42 } root={ root } targetUri="at://target" /> );
		expect( screen.queryByText( 'sibling reply' ) ).toBeNull();
		// Only parent + target should be in the article list.
		const articles = screen.getAllByRole( 'article' );
		expect( articles ).toHaveLength( 2 );
		expect( articles[ 0 ] ).toHaveTextContent( 'parent' );
		expect( articles[ 1 ] ).toHaveTextContent( 'target' );
	} );

	it( 'caps the parent walk at 80 nodes to defend against deep chains', () => {
		let chain: AtmosphereThreadNode | null = null;
		for ( let i = 0; i < 100; i++ ) {
			const node: AtmosphereThreadNode = {
				type: 'post',
				post: makeFeedItem( { uri: `at://p${ i }`, text: `p${ i }` } ),
				parent: chain,
				replies: [],
			};
			chain = node;
		}
		const root: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem( { uri: 'at://target', text: 'target' } ),
			parent: chain,
			replies: [],
		};
		renderWithProvider( <ThreadTree connectionId={ 42 } root={ root } targetUri="at://target" /> );
		expect( screen.getAllByRole( 'article' ) ).toHaveLength( 81 );
	} );

	it( 'breaks out of an actual parent cycle without duplicating nodes', () => {
		// Build A.parent → B, then point B.parent → A to form a cycle.
		const a = makeFeedItem( { uri: 'at://a', text: 'cycle-a', html: '<p>cycle-a</p>' } );
		const b = makeFeedItem( { uri: 'at://b', text: 'cycle-b', html: '<p>cycle-b</p>' } );
		const nodeA: AtmosphereThreadNode = {
			type: 'post',
			post: a,
			parent: null,
			replies: [],
		};
		const nodeB: AtmosphereThreadNode = {
			type: 'post',
			post: b,
			parent: nodeA,
			replies: [],
		};
		( nodeA as { parent: AtmosphereThreadNode | null } ).parent = nodeB;
		const root: AtmosphereThreadNode = {
			type: 'post',
			post: makeFeedItem( {
				uri: 'at://target',
				text: 'cycle-target',
				html: '<p>cycle-target</p>',
			} ),
			parent: nodeA,
			replies: [],
		};
		renderWithProvider( <ThreadTree connectionId={ 42 } root={ root } targetUri="at://target" /> );
		// Target + nodeA + nodeB — cycle detection breaks before re-rendering nodeA.
		expect( screen.getAllByRole( 'article' ) ).toHaveLength( 3 );
		expect( screen.getAllByText( 'cycle-a' ) ).toHaveLength( 1 );
		expect( screen.getAllByText( 'cycle-b' ) ).toHaveLength( 1 );
		expect( screen.getAllByText( 'cycle-target' ) ).toHaveLength( 1 );
	} );
} );
