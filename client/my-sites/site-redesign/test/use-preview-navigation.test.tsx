/** @jest-environment jsdom */
import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { resolvePreviewNavigation, usePreviewNavigation } from '../use-preview-navigation';
import type { PreviewRoute } from '../api';

const routes = [
	{ path: '/about/' },
	{ path: '/news/' },
	{ path: '/?page_id=13' },
] as PreviewRoute[];
const message = {
	source: 'site-redesign-preview',
	type: 'navigate',
	generation_id: 'gen_1',
	href: '/about/',
};
test.each( [
	[ '/about/', '/about/' ],
	[ '../news/', '/news/' ],
	[ '/?page_id=13', '/?page_id=13' ],
	[ 'https://example.wordpress.com/about/', '/about/' ],
] )( 'allows a same-site whitelisted route %s', ( href, expected ) => {
	expect(
		resolvePreviewNavigation(
			{ ...message, href },
			'gen_1',
			'https://example.wordpress.com/',
			'/about/',
			routes
		)
	).toBe( expected );
} );
test.each( [
	{ ...message, generation_id: 'gen_old' },
	{ ...message, href: 'https://evil.example/about/' },
	{ ...message, href: '/unknown/' },
	{ ...message, href: 'javascript:alert(1)' },
	{ ...message, source: 'another-frame' },
	{ ...message, href: 'http://[' },
] )( 'rejects stale, malformed, untrusted or unlisted navigation %p', ( value ) => {
	expect(
		resolvePreviewNavigation( value, 'gen_1', 'https://example.wordpress.com/', '/', routes )
	).toBeNull();
} );
test( 'accepts messages only from the current iframe and removes its listener on exit', () => {
	const setPath = jest.fn();
	function Host() {
		const frame = useRef< HTMLIFrameElement >( null );
		usePreviewNavigation( frame, 'gen_1', 'https://example.wordpress.com/', '/', routes, setPath );
		return <iframe ref={ frame } title="Candidate" />;
	}
	const { getByTitle, unmount } = render( <Host /> );
	const frame = getByTitle( 'Candidate' ) as HTMLIFrameElement;
	const frameWindow = frame.contentWindow;
	act( () =>
		window.dispatchEvent( new MessageEvent( 'message', { data: message, source: window } ) )
	);
	expect( setPath ).not.toHaveBeenCalled();
	act( () =>
		window.dispatchEvent( new MessageEvent( 'message', { data: message, source: frameWindow } ) )
	);
	expect( setPath ).toHaveBeenCalledWith( '/about/' );
	unmount();
	setPath.mockClear();
	act( () =>
		window.dispatchEvent( new MessageEvent( 'message', { data: message, source: frameWindow } ) )
	);
	expect( setPath ).not.toHaveBeenCalled();
} );
