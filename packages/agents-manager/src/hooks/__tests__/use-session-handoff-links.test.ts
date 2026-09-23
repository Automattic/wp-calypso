/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
const mockContext = {
	siteKey: '111',
	site: { ID: 111, domain: 'example.com' },
	currentUser: { ID: 7 },
};

jest.mock( '../../contexts', () => ( { useAgentsManagerContext: () => mockContext } ) );

import { fireEvent, renderHook } from '@testing-library/react';
import { saveSessionId } from '../../utils/agent-session';
import { useSessionHandoffLinks } from '../use-session-handoff-links';

const CALYPSO_LINK = 'https://wordpress.com/home/example.com';
const HANDED_OFF_LINK = `${ CALYPSO_LINK }?wp-agent-chat=sess&wp-agent-site=111`;
const assign = jest.fn();

beforeAll( () => {
	// A writable stub, so the handoff does not hit jsdom's unimplemented navigation.
	Reflect.deleteProperty( window, 'location' );
	( window as { location: unknown } ).location = { origin: 'https://example.com', assign };
	// Swallow the clicks the hook leaves to the browser, for the same reason.
	window.addEventListener( 'click', ( event ) => event.preventDefault() );
} );

function renderLink( attributes: Record< string, string > ): HTMLAnchorElement {
	const anchor = document.createElement( 'a' );
	for ( const [ name, value ] of Object.entries( attributes ) ) {
		anchor.setAttribute( name, value );
	}
	document.body.append( anchor );
	return anchor;
}

/** The URL the hook navigated to on click, if it did. */
function handoffOnClick(
	attributes: Record< string, string >,
	init?: MouseEventInit
): string | undefined {
	fireEvent.click( renderLink( attributes ), init );
	return assign.mock.calls[ 0 ]?.[ 0 ];
}

describe( 'useSessionHandoffLinks', () => {
	beforeEach( () => {
		assign.mockClear();
		document.body.innerHTML = '';
		sessionStorage.clear();
		mockContext.siteKey = '111';
		saveSessionId( 'sess', 'wp-orchestrator', '111', 7 );
	} );

	it.each( [
		[ 'a plain link', { href: CALYPSO_LINK } ],
		[ 'a link targeting the same tab', { href: CALYPSO_LINK, target: '_self' } ],
	] )( 'hands off on %s to another Agents Manager origin', ( _label, attributes ) => {
		renderHook( () => useSessionHandoffLinks( 'wp-orchestrator' ) );

		expect( handoffOnClick( attributes ) ).toBe( HANDED_OFF_LINK );
	} );

	it( 'hands off when an element inside the link is clicked', () => {
		renderHook( () => useSessionHandoffLinks( 'wp-orchestrator' ) );
		const label = document.createElement( 'span' );
		renderLink( { href: CALYPSO_LINK } ).append( label );

		fireEvent.click( label );

		expect( assign ).toHaveBeenCalledWith( HANDED_OFF_LINK );
	} );

	it.each( [
		[ 'a meta-key click', { href: CALYPSO_LINK }, { metaKey: true } ],
		[ 'a ctrl-key click', { href: CALYPSO_LINK }, { ctrlKey: true } ],
		[ 'a middle click', { href: CALYPSO_LINK }, { button: 1 } ],
		[ 'a new-tab link', { href: CALYPSO_LINK, target: '_blank' }, {} ],
		[ 'a download link', { href: CALYPSO_LINK, download: '' }, {} ],
		[ 'a same-origin link', { href: '/wp-admin/' }, {} ],
	] )( 'leaves %s alone', ( _label, attributes, init ) => {
		renderHook( () => useSessionHandoffLinks( 'wp-orchestrator' ) );

		expect( handoffOnClick( attributes, init ) ).toBeUndefined();
	} );

	it( 'leaves a click the host already handled alone', () => {
		renderHook( () => useSessionHandoffLinks( 'wp-orchestrator' ) );
		const anchor = renderLink( { href: CALYPSO_LINK } );
		anchor.addEventListener( 'click', ( event ) => event.preventDefault() );

		fireEvent.click( anchor );

		expect( assign ).not.toHaveBeenCalled();
	} );

	it( 'ignores clicks dispatched on the document itself', () => {
		renderHook( () => useSessionHandoffLinks( 'wp-orchestrator' ) );

		expect( () => fireEvent.click( document ) ).not.toThrow();
		expect( assign ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'without a session for this scope', 'other-agent', '111' ],
		[ 'for a surface-bound agent', 'reader-chat', '111' ],
		[ 'for a chat without a site scope', 'wp-orchestrator', 'no-site' ],
	] )( 'leaves links alone %s', ( _label, agentId, siteKey ) => {
		mockContext.siteKey = siteKey;
		saveSessionId( 'sess', agentId, siteKey, 7 );
		renderHook( () => useSessionHandoffLinks( agentId ) );

		expect( handoffOnClick( { href: CALYPSO_LINK } ) ).toBeUndefined();
	} );

	it( 'stops after unmounting', () => {
		const { unmount } = renderHook( () => useSessionHandoffLinks( 'wp-orchestrator' ) );
		unmount();

		expect( handoffOnClick( { href: CALYPSO_LINK } ) ).toBeUndefined();
	} );
} );
