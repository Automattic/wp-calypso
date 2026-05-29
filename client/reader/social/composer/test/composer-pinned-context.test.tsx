/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ComposerPinnedContext } from '../composer-pinned-context';
import type { ActiveMode, PreviewPost } from '../composer-provider';

const previewPost = {
	uri: 'at://x',
	cid: 'c',
	author: {
		did: 'did:plc:alice',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		avatar: null,
	},
	text: 'Excited to share this!',
	html: '<p>Excited to share this!</p>',
};

const replyMode: ActiveMode = {
	kind: 'reply',
	connectionId: 1,
	root: { uri: 'at://x', cid: 'c' },
	parent: { uri: 'at://x', cid: 'c' },
	previewPost,
};

const standaloneMode: ActiveMode = {
	kind: 'standalone',
	connectionId: 1,
	entry_point: 'fab',
};

describe( '<ComposerPinnedContext>', () => {
	it( 'renders the author chip and post text for reply mode', () => {
		render( <ComposerPinnedContext mode={ replyMode } /> );
		expect( screen.getByText( 'Alice' ) ).toBeVisible();
		expect( screen.getByText( '@alice.bsky.social' ) ).toBeVisible();
		expect( screen.getByText( /Excited to share this/ ) ).toBeVisible();
	} );

	it( 'renders nothing for standalone mode', () => {
		const { container } = render( <ComposerPinnedContext mode={ standaloneMode } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when mode is null', () => {
		const { container } = render( <ComposerPinnedContext mode={ null } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'falls back to raw text when previewPost.html is empty', () => {
		const previewWithoutHtml: PreviewPost = {
			uri: 'at://x',
			cid: 'c',
			author: {
				handle: 'alice.bsky.social',
				display_name: 'Alice',
			},
			text: 'Plain text only',
			html: '',
		};
		const replyModeNoHtml: ActiveMode = {
			kind: 'reply',
			connectionId: 42,
			root: { uri: 'at://r', cid: 'rcid' },
			parent: { uri: 'at://p', cid: 'pcid' },
			previewPost: previewWithoutHtml,
		};
		render( <ComposerPinnedContext mode={ replyModeNoHtml } /> );
		expect( screen.getByText( 'Alice' ) ).toBeVisible();
		expect( screen.getByText( 'Plain text only' ) ).toBeVisible();
	} );
} );
