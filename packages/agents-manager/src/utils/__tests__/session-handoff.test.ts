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
		[ 'Calypso', 'https://wordpress.com/sites', true ],
		[ 'the Dashboard', 'https://my.wordpress.com/sites/example.com', true ],
		[ 'wp-admin of a WordPress.com site', 'https://blog.wordpress.com/wp-admin/', true ],
		[ 'wp-admin of a staging site', 'https://blog.wpcomstaging.com/wp-admin/', true ],
		[ 'the frontend of a WordPress.com site', 'https://blog.wordpress.com/2026/09/post/', false ],
		[ 'a WordPress.com API host', 'https://public-api.wordpress.com/rest/v1.1/me', false ],
		[ 'a clear-text HTTP link', 'http://blog.wordpress.com/wp-admin/', false ],
		[ 'the current origin', 'https://example.com/wp-admin/', false ],
		[ 'a host that only ends in the name', 'https://notwordpress.com/wp-admin/', false ],
		[ 'a third-party host', 'https://example.org/wp-admin/', false ],
		[ 'a mailto link', 'mailto:hello@wordpress.com', false ],
	] )( 'handles %s', ( _label, href, expected ) => {
		expect( isHandoffDestination( new URL( href ), ORIGIN ) ).toBe( expected );
	} );

	it( 'accepts wp-admin on the site domain from another origin', () => {
		const domain = 'example.org';

		expect(
			isHandoffDestination( new URL( 'https://example.org/wp-admin/' ), ORIGIN, domain )
		).toBe( true );
		expect( isHandoffDestination( new URL( 'https://example.org/' ), ORIGIN, domain ) ).toBe(
			false
		);
		expect( isHandoffDestination( new URL( 'https://other.org/wp-admin/' ), ORIGIN, domain ) ).toBe(
			false
		);
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
