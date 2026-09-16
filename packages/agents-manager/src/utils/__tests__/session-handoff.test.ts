import {
	addSessionHandoff,
	isHandoffAgent,
	isHandoffDestination,
	readSessionHandoff,
} from '../session-handoff';

const ORIGIN = 'https://example.com';

describe( 'isHandoffAgent', () => {
	it.each( [
		[ 'the orchestrator', 'wp-orchestrator', true ],
		[ 'unified chat', 'wpcom-workflow-unified_chat', true ],
		[ 'an unresolved agent', undefined, false ],
		[ 'reader chat', 'reader-chat', false ],
		[ 'Plugin Compass', 'wpcom-workflow-plugin_compass', false ],
		[ 'a host override', 'wpcom-workflow-support_chat', false ],
	] )( 'handles %s', ( _label, agentId, expected ) => {
		expect( isHandoffAgent( agentId ) ).toBe( expected );
	} );
} );

describe( 'isHandoffDestination', () => {
	it.each( [
		[ 'WordPress.com', 'https://wordpress.com/sites', true ],
		[ 'a WordPress.com site', 'https://blog.wordpress.com/wp-admin/', true ],
		[ 'a staging site', 'https://blog.wpcomstaging.com/wp-admin/', true ],
		[ 'the current origin', 'https://example.com/wp-admin/', false ],
		[ 'a host that only ends in the name', 'https://notwordpress.com/', false ],
		[ 'a third-party host', 'https://example.org/', false ],
		[ 'a mailto link', 'mailto:hello@wordpress.com', false ],
	] )( 'handles %s', ( _label, href, expected ) => {
		expect( isHandoffDestination( new URL( href ), ORIGIN ) ).toBe( expected );
	} );

	it( 'accepts the site domain from another origin', () => {
		const link = new URL( 'https://example.org/wp-admin/' );

		expect( isHandoffDestination( link, ORIGIN, 'example.org' ) ).toBe( true );
		expect( isHandoffDestination( link, ORIGIN, 'other.org' ) ).toBe( false );
	} );
} );

describe( 'addSessionHandoff and readSessionHandoff', () => {
	it( 'round-trips the session and site scope', () => {
		const href = addSessionHandoff( 'https://wordpress.com/home/example.com?a=1', 'sess', '111' );

		expect( href ).toBe(
			'https://wordpress.com/home/example.com?a=1&wp-agent-chat=sess&wp-agent-site=111'
		);
		expect( readSessionHandoff( new URL( href ).search ) ).toEqual( {
			sessionId: 'sess',
			siteKey: '111',
		} );
	} );

	it( 'replaces an existing handoff', () => {
		const href = addSessionHandoff( 'https://wordpress.com/?wp-agent-chat=old', 'new', '111' );

		expect( href ).toBe( 'https://wordpress.com/?wp-agent-chat=new&wp-agent-site=111' );
	} );

	it.each( [
		[ 'no handoff', '?a=1', null ],
		[ 'an empty session', '?wp-agent-chat=&wp-agent-site=111', null ],
		[ 'a session without a site', '?wp-agent-chat=sess', { sessionId: 'sess' } ],
	] )( 'reads %s', ( _label, search, expected ) => {
		expect( readSessionHandoff( search ) ).toEqual( expected );
	} );
} );
