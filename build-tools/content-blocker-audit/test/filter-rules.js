import { createMatcher, isRelevantRule, parseFilterList, parseRule } from '../filter-rules';

const PAGE_URL = 'https://wordpress.com/setup/onboarding/user';
const ASSET_BASE = 'https://wordpress.com/calypso/evergreen/';

function match( rules, name, overrides = {} ) {
	const matcher = createMatcher( parseFilterList( rules.join( '\n' ), 'test' ) );
	return matcher.match( {
		url: ASSET_BASE + name,
		type: name.endsWith( '.css' ) ? 'stylesheet' : 'script',
		pageUrl: PAGE_URL,
		...overrides,
	} );
}

describe( 'parseRule', () => {
	test( 'ignores comments, headers and cosmetic filters', () => {
		expect( parseRule( '! Title: EasyList' ) ).toBeNull();
		expect( parseRule( '[Adblock Plus 2.0]' ) ).toBeNull();
		expect( parseRule( '##.cookie-banner' ) ).toBeNull();
		expect( parseRule( 'example.com#@#.ad' ) ).toBeNull();
		expect( parseRule( 'example.com#$#body { color: red }' ) ).toBeNull();
	} );

	test( 'ignores rules that modify rather than block requests', () => {
		expect( parseRule( '||wordpress.com^$csp=script-src none' ) ).toBeNull();
		expect( parseRule( '$removeparam=utm_source' ) ).toBeNull();
		expect( parseRule( '/cookie-banner.$redirect-rule=noop.js' ) ).toBeNull();
	} );

	test( 'ignores rules with options it does not understand', () => {
		expect( parseRule( '/cookie-banner.$some-future-option' ) ).toBeNull();
	} );

	test( 'keeps the source list and line', () => {
		expect( parseRule( '-cookie-banner.', { list: 'easylist-cookie', line: 16 } ) ).toMatchObject( {
			list: 'easylist-cookie',
			line: 16,
			raw: '-cookie-banner.',
		} );
	} );
} );

describe( 'createMatcher', () => {
	test( 'matches plain substrings', () => {
		const result = match(
			[ '-cookie-banner.' ],
			'async-load-calypso-blocks-cookie-banner.abc.min.js'
		);
		expect( result.blocked ).toBe( true );
		expect( result.blockedBy.map( ( rule ) => rule.raw ) ).toEqual( [ '-cookie-banner.' ] );
	} );

	test( 'does not match the renamed chunk', () => {
		expect(
			match( [ '-cookie-banner.' ], 'async-load-calypso-blocks-privacy-prefs.abc.min.js' ).blocked
		).toBe( false );
	} );

	test( 'treats `^` as a separator and `*` as a wildcard', () => {
		expect( match( [ '/ads^' ], 'ads/thing.min.js' ).blocked ).toBe( true );
		expect( match( [ '/ads^' ], 'adsense.min.js' ).blocked ).toBe( false );
		expect( match( [ '/calypso/*/tracking.' ], 'tracking.abc.min.js' ).blocked ).toBe( true );
	} );

	test( 'honours hostname and start anchors', () => {
		expect( match( [ '||wordpress.com/calypso/*/banner' ], 'banner.min.js' ).blocked ).toBe( true );
		expect( match( [ '||press.com/calypso/' ], 'banner.min.js' ).blocked ).toBe( false );
		expect( match( [ '|https://wordpress.com/calypso/' ], 'x.min.js' ).blocked ).toBe( true );
		expect( match( [ '|/calypso/' ], 'x.min.js' ).blocked ).toBe( false );
	} );

	test( 'supports regex rules', () => {
		expect( match( [ '/cookie-?(banner|consent)\\./' ], 'cookies.min.js' ).blocked ).toBe( false );
		expect( match( [ '/cookie-?(banner|consent)\\./' ], 'cookie-consent.min.js' ).blocked ).toBe(
			true
		);
	} );

	test( 'applies resource types', () => {
		expect( match( [ '-cookie-banner.$script' ], 'x-cookie-banner.min.css' ).blocked ).toBe(
			false
		);
		expect( match( [ '-cookie-banner.$css' ], 'x-cookie-banner.min.css' ).blocked ).toBe( true );
		expect( match( [ '-cookie-banner.$~script' ], 'x-cookie-banner.min.js' ).blocked ).toBe(
			false
		);
		expect( match( [ '-cookie-banner.$image' ], 'x-cookie-banner.min.js' ).blocked ).toBe( false );
	} );

	test( 'applies party and domain restrictions', () => {
		expect( match( [ '-cookie-banner.$third-party' ], 'x-cookie-banner.min.js' ).blocked ).toBe(
			false
		);
		expect( match( [ '-cookie-banner.$1p' ], 'x-cookie-banner.min.js' ).blocked ).toBe( true );
		expect(
			match( [ '-cookie-banner.$domain=example.com' ], 'x-cookie-banner.min.js' ).blocked
		).toBe( false );
		expect(
			match( [ '-cookie-banner.$domain=wordpress.com' ], 'x-cookie-banner.min.js' ).blocked
		).toBe( true );
		expect(
			match( [ '-cookie-banner.$domain=~wordpress.com' ], 'x-cookie-banner.min.js' ).blocked
		).toBe( false );
		expect(
			match( [ '-cookie-banner.$denyallow=wordpress.com' ], 'x-cookie-banner.min.js' ).blocked
		).toBe( false );
	} );

	test( 'lets exceptions override blocks unless the block is important', () => {
		const exception = '@@||wordpress.com/calypso/$script';
		const allowed = match( [ '-cookie-banner.', exception ], 'x-cookie-banner.min.js' );
		expect( allowed.blocked ).toBe( false );
		expect( allowed.allowedBy.map( ( rule ) => rule.raw ) ).toEqual( [ exception ] );

		expect(
			match( [ '-cookie-banner.$important', exception ], 'x-cookie-banner.min.js' ).blocked
		).toBe( true );
	} );

	test( 'treats document exceptions as allowing the whole page', () => {
		expect(
			match( [ '-cookie-banner.', '@@||wordpress.com^$document' ], 'x-cookie-banner.min.js' )
				.blocked
		).toBe( false );
	} );

	test( 'drops rules disabled with $badfilter', () => {
		expect(
			match( [ '-cookie-banner.', '-cookie-banner.$badfilter' ], 'x-cookie-banner.min.js' ).blocked
		).toBe( false );
	} );

	test( 'matches $badfilter regardless of option order', () => {
		expect(
			match(
				[ '-cookie-banner.$script,1p', '-cookie-banner.$badfilter,1p,script' ],
				'x-cookie-banner.min.js'
			).blocked
		).toBe( false );
		expect(
			match(
				[ '-cookie-banner.$script', '-cookie-banner.$badfilter,css' ],
				'x-cookie-banner.min.js'
			).blocked
		).toBe( true );
	} );

	test( 'honours negated strict party options', () => {
		expect( match( [ '-cookie-banner.$~strict3p' ], 'x-cookie-banner.min.js' ).blocked ).toBe(
			true
		);
		expect( match( [ '-cookie-banner.$~strict1p' ], 'x-cookie-banner.min.js' ).blocked ).toBe(
			false
		);
	} );
} );

describe( 'parseFilterList', () => {
	const raws = ( lines ) =>
		parseFilterList( lines.join( '\n' ), 'test' ).map( ( rule ) => rule.raw );

	test( 'skips rules for platforms the audit does not cover', () => {
		expect(
			raws( [ '!#if env_mobile', '-mobile.', '!#endif', '!#if !ext_ublock', '-other.', '!#endif' ] )
		).toEqual( [] );
	} );

	test( 'keeps rules that apply to desktop uBlock Origin on any covered browser', () => {
		expect(
			raws( [
				'!#if env_firefox',
				'-firefox.',
				'!#else',
				'-not-firefox.',
				'!#endif',
				'!#if !env_mobile && (env_chromium || env_safari)',
				'-chromium.',
				'!#endif',
				'-everywhere.',
			] )
		).toEqual( [ '-firefox.', '-not-firefox.', '-chromium.', '-everywhere.' ] );
	} );

	test( 'handles nested blocks', () => {
		expect(
			raws( [ '!#if ext_ublock', '!#if env_mobile', '-mobile.', '!#endif', '-ublock.', '!#endif' ] )
		).toEqual( [ '-ublock.' ] );
	} );
} );

describe( 'isRelevantRule', () => {
	const context = { pageHosts: [ 'wordpress.com' ], assetHosts: [ 'wordpress.com' ] };
	const relevant = ( line ) => isRelevantRule( parseRule( line ), context );

	test( 'keeps generic path rules', () => {
		expect( relevant( '-cookie-banner.' ) ).toBe( true );
		expect( relevant( '/analytics.js' ) ).toBe( true );
	} );

	test( 'keeps rules anchored to the asset host', () => {
		expect( relevant( '||wordpress.com/calypso/x' ) ).toBe( true );
		expect( relevant( '||cdn*.wordpress.com^' ) ).toBe( true );
	} );

	test( 'drops rules for other hosts, pages and resource types', () => {
		expect( relevant( '||tracker.example^' ) ).toBe( false );
		expect( relevant( '-cookie-banner.$domain=example.com' ) ).toBe( false );
		expect( relevant( '-cookie-banner.$image' ) ).toBe( false );
	} );
} );
