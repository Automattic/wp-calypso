import { DataHelper, HelpCenterComponent, ReaderPage } from '@automattic/calypso-e2e';
import { expect, tags, test } from '../../lib/pw-base';
import type { Locator, Page } from '@playwright/test';

const COLOR_SCHEME_PREFERENCE = 'hosting-dashboard-color-scheme';
const DASHBOARD_OPT_IN_PREFERENCE = 'hosting-dashboard-opt-in';
const ACCOUNT_RECOVERY_SNOOZE_PREFERENCE = 'account-recovery-interstitial-snoozed-until';
const REQUIRED_TOKENS = [
	'--dashboard__background-color',
	'--dashboard-surface__background-color',
	'--dashboard__text-color',
	'--color-surface',
	'--color-text',
	'--color-border-subtle',
	'--wp-components-color-background',
	'--wp-components-color-gray-800',
	'--wp-components-color-accent',
] as const;

const TOKEN_ALIASES = {
	'--color-surface': '--dashboard-surface__background-color',
	'--color-text': '--dashboard__text-color',
	'--wp-components-color-background': '--dashboard-surface__background-color',
} as const;
const MINIMUM_NORMAL_TEXT_CONTRAST_RATIO = 4.5;

type TokenName = ( typeof REQUIRED_TOKENS )[ number ];

type RGB = {
	alpha: number;
	blue: number;
	green: number;
	red: number;
};

function clearPersistedCalypsoState() {
	const persistedStatePattern = /^(redux-state|query-state)-/;

	try {
		window.localStorage.removeItem( 'REACT_QUERY_OFFLINE_CACHE' );

		for ( const key of Object.keys( window.localStorage ) ) {
			if ( persistedStatePattern.test( key ) ) {
				window.localStorage.removeItem( key );
			}
		}
	} catch {
		// Ignore storage access errors so the test can still rely on the API response override.
	}
}

function addDarkModePreference(
	response: Record< string, unknown > | undefined
): Record< string, unknown > {
	const preferencesResponse = response ?? {};
	const responseBody = preferencesResponse.body;
	const calypsoPreferences =
		typeof preferencesResponse.calypso_preferences === 'object' &&
		preferencesResponse.calypso_preferences !== null
			? preferencesResponse.calypso_preferences
			: {};

	const darkPreferencesResponse = {
		...preferencesResponse,
		calypso_preferences: {
			...calypsoPreferences,
			[ COLOR_SCHEME_PREFERENCE ]: 'dark',
			// Snooze the account-recovery interstitial (a unix timestamp, in seconds)
			// so it doesn't mount over the dashboard routes this suite asserts on.
			[ ACCOUNT_RECOVERY_SNOOZE_PREFERENCE ]:
				Math.floor( Date.now() / 1000 ) + 10 * 365 * 24 * 60 * 60,
			// Themes dark mode is additionally gated behind the dashboard opt-in
			// (#110825 `shouldEnableThemesColorScheme`), so the preference override
			// must also satisfy `hasDashboardOptIn` for the Themes suite.
			[ DASHBOARD_OPT_IN_PREFERENCE ]: {
				value: 'opt-in',
				updated_at: '2026-01-01T00:00:00+00:00',
			},
		},
	};

	if (
		typeof responseBody === 'object' &&
		responseBody !== null &&
		! Array.isArray( responseBody )
	) {
		return {
			...darkPreferencesResponse,
			body: addDarkModePreference( responseBody as Record< string, unknown > ),
		};
	}

	return darkPreferencesResponse;
}

async function forceDarkModePreference( page: Page ) {
	await page.addInitScript( clearPersistedCalypsoState );
	await page.evaluate( clearPersistedCalypsoState ).catch( () => undefined );

	await page.context().route( '**/me/preferences**', async ( route ) => {
		const url = new URL( route.request().url() );
		const isPreferencesApiRequest = /\/(?:(?:rest|wpcom)\/v[\d.]+\/)?me\/preferences\/?$/.test(
			url.pathname
		);

		if ( route.request().method() !== 'GET' || ! isPreferencesApiRequest ) {
			await route.continue();
			return;
		}

		let preferencesResponse: Record< string, unknown > = {};
		try {
			const response = await route.fetch();
			preferencesResponse = await response.json();
		} catch {
			preferencesResponse = {};
		}

		await route.fulfill( {
			contentType: 'application/json',
			status: 200,
			body: JSON.stringify( addDarkModePreference( preferencesResponse ) ),
		} );
	} );
}

function collectPageIssues( page: Page ) {
	const issues: string[] = [];
	const isRelevantIssue = ( text: string ) =>
		/ChunkLoadError|stylesheet|css chunk|sass|token/i.test( text );

	page.on( 'pageerror', ( error ) => {
		if ( ! isRelevantIssue( error.message ) ) {
			return;
		}

		issues.push( `pageerror: ${ error.message }` );
	} );

	page.on( 'console', ( message ) => {
		if ( message.type() !== 'error' ) {
			return;
		}

		const text = message.text();
		if ( isRelevantIssue( text ) ) {
			issues.push( `console: ${ text }` );
		}
	} );

	return () => {
		expect( issues ).toEqual( [] );
	};
}

async function expectDarkModeRoot(
	page: Page,
	options: {
		bodyClasses?: string[];
		expectColorSchemeBodyClass?: boolean;
	} = {}
) {
	await expect( page.locator( 'html' ) ).toHaveAttribute( 'data-theme', 'dark' );

	if ( options.expectColorSchemeBodyClass ) {
		await expect( page.locator( 'body' ) ).toHaveClass( /(^|\s)color-scheme(\s|$)/ );
	}

	for ( const bodyClass of options.bodyClasses ?? [] ) {
		await expect( page.locator( 'body' ) ).toHaveClass(
			new RegExp( `(^|\\s)${ bodyClass }(\\s|$)` )
		);
	}
}

// The themes dark-mode body class is applied only after remote preferences
// (dark scheme + dashboard opt-in) load and re-render the page. On a cold
// `visitTheme` navigation that can take longer than the default expect
// timeout, so wait on the gated class explicitly before asserting downstream
// surfaces, matching the readiness waits used elsewhere in this suite.
async function waitForThemesDarkModeReady( page: Page ) {
	await expect( page.locator( 'html' ) ).toHaveAttribute( 'data-theme', 'dark', {
		timeout: 30_000,
	} );
	await expect( page.locator( 'body' ) ).toHaveClass( /(^|\s)is-themes-dark-mode(\s|$)/, {
		timeout: 30_000,
	} );
}

async function resolveCssColorToken( page: Page, tokenName: TokenName ) {
	return await page.evaluate( ( token ) => {
		const probe = document.createElement( 'span' );
		probe.style.color = `var(${ token })`;
		document.body.appendChild( probe );
		const value = window.getComputedStyle( probe ).color;
		probe.remove();
		return value;
	}, tokenName );
}

function parseRgb( value: string ): RGB | null {
	const rgbMatch = value
		.trim()
		.match( /^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)$/ );

	if ( rgbMatch ) {
		return {
			red: Number( rgbMatch[ 1 ] ),
			green: Number( rgbMatch[ 2 ] ),
			blue: Number( rgbMatch[ 3 ] ),
			alpha: rgbMatch[ 4 ] === undefined ? 1 : Number( rgbMatch[ 4 ] ),
		};
	}

	const srgbMatch = value
		.trim()
		.match( /^color\(\s*srgb\s+([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)$/ );

	if ( srgbMatch ) {
		const parseChannel = ( channel: string ) => {
			if ( channel.endsWith( '%' ) ) {
				return Math.round( ( Number( channel.slice( 0, -1 ) ) / 100 ) * 255 );
			}

			return Math.round( Number( channel ) * 255 );
		};
		const parseAlpha = ( alpha: string | undefined ) => {
			if ( alpha === undefined ) {
				return 1;
			}

			return alpha.endsWith( '%' ) ? Number( alpha.slice( 0, -1 ) ) / 100 : Number( alpha );
		};

		return {
			red: parseChannel( srgbMatch[ 1 ] ),
			green: parseChannel( srgbMatch[ 2 ] ),
			blue: parseChannel( srgbMatch[ 3 ] ),
			alpha: parseAlpha( srgbMatch[ 4 ] ),
		};
	}

	return null;
}

function brightness( color: RGB ) {
	return 0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue;
}

function relativeLuminance( color: RGB ) {
	function normalizeChannel( channel: number ) {
		const value = channel / 255;
		return value <= 0.03928 ? value / 12.92 : Math.pow( ( value + 0.055 ) / 1.055, 2.4 );
	}

	return (
		0.2126 * normalizeChannel( color.red ) +
		0.7152 * normalizeChannel( color.green ) +
		0.0722 * normalizeChannel( color.blue )
	);
}

function contrastRatio( a: RGB, b: RGB ) {
	const lighter = Math.max( relativeLuminance( a ), relativeLuminance( b ) );
	const darker = Math.min( relativeLuminance( a ), relativeLuminance( b ) );
	return ( lighter + 0.05 ) / ( darker + 0.05 );
}

function normalizeColor( color: string ) {
	const rgb = parseRgb( color );
	if ( ! rgb ) {
		return color.trim();
	}
	return `rgba(${ rgb.red }, ${ rgb.green }, ${ rgb.blue }, ${ rgb.alpha })`;
}

async function expectSharedDarkTokens( page: Page ) {
	const rawTokens = await page.evaluate( ( tokenNames ) => {
		const host = document.body ?? document.documentElement;
		const computedStyle = window.getComputedStyle( host );
		return Object.fromEntries(
			tokenNames.map( ( tokenName ) => [ tokenName, computedStyle.getPropertyValue( tokenName ) ] )
		);
	}, REQUIRED_TOKENS );

	for ( const tokenName of REQUIRED_TOKENS ) {
		expect( rawTokens[ tokenName ]?.trim(), `${ tokenName } is defined` ).not.toBe( '' );
	}

	const resolvedTokens = Object.fromEntries(
		await Promise.all(
			REQUIRED_TOKENS.map( async ( tokenName ) => [
				tokenName,
				normalizeColor( await resolveCssColorToken( page, tokenName ) ),
			] )
		)
	) as Record< TokenName, string >;

	for ( const [ alias, source ] of Object.entries( TOKEN_ALIASES ) as Array<
		[ keyof typeof TOKEN_ALIASES, ( typeof TOKEN_ALIASES )[ keyof typeof TOKEN_ALIASES ] ]
	> ) {
		expect( resolvedTokens[ alias ] ).toBe( resolvedTokens[ source ] );
	}

	const background = parseRgb( resolvedTokens[ '--dashboard__background-color' ] );
	const surface = parseRgb( resolvedTokens[ '--dashboard-surface__background-color' ] );
	const text = parseRgb( resolvedTokens[ '--dashboard__text-color' ] );
	const gray800 = parseRgb( resolvedTokens[ '--wp-components-color-gray-800' ] );

	expect( background, '--dashboard__background-color resolves to rgb' ).not.toBeNull();
	expect( surface, '--dashboard-surface__background-color resolves to rgb' ).not.toBeNull();
	expect( text, '--dashboard__text-color resolves to rgb' ).not.toBeNull();
	expect( gray800, '--wp-components-color-gray-800 resolves to rgb' ).not.toBeNull();

	expect( brightness( background as RGB ) ).toBeLessThan( 80 );
	expect( brightness( surface as RGB ) ).toBeLessThan( 100 );
	expect( brightness( text as RGB ) ).toBeGreaterThan( 150 );
	expect( brightness( gray800 as RGB ) ).toBeGreaterThan( 150 );

	return resolvedTokens;
}

async function getElementStyle( locator: Locator ) {
	await locator.waitFor( { state: 'visible' } );

	return await locator.evaluate( ( element ) => {
		function isTransparent( value: string ) {
			return value === 'transparent' || value === 'rgba(0, 0, 0, 0)';
		}

		let current: Element | null = element;
		let backgroundColor = '';

		while ( current ) {
			const style = window.getComputedStyle( current );
			backgroundColor = style.backgroundColor;
			if ( backgroundColor && ! isTransparent( backgroundColor ) ) {
				break;
			}
			current = current.parentElement;
		}

		const style = window.getComputedStyle( element );
		return {
			backgroundColor,
			borderColor: style.borderColor,
			color: style.color,
			fill: style.fill,
		};
	} );
}

async function expectNoObviousLightSurface( locator: Locator ) {
	const styles = await getElementStyle( locator );
	const background = parseRgb( styles.backgroundColor );
	const text = parseRgb( styles.color );
	const border = parseRgb( styles.borderColor );

	expect( background, 'surface background resolves to rgb' ).not.toBeNull();
	expect( text, 'surface text resolves to rgb' ).not.toBeNull();
	expect( brightness( background as RGB ) ).toBeLessThan( 130 );
	expect( contrastRatio( background as RGB, text as RGB ) ).toBeGreaterThanOrEqual(
		MINIMUM_NORMAL_TEXT_CONTRAST_RATIO
	);

	if ( border && border.alpha > 0 ) {
		expect( brightness( border ) ).toBeLessThan( 245 );
	}
}

async function firstVisibleLocator( page: Page, selectors: string[] ) {
	for ( const selector of selectors ) {
		const locator = page.locator( selector ).first();
		const isVisible = await locator
			.waitFor( { state: 'visible', timeout: 5000 } )
			.then( () => true )
			.catch( () => false );

		if ( isVisible ) {
			return locator;
		}
	}

	throw new Error( `No visible locator found for selectors: ${ selectors.join( ', ' ) }` );
}

async function expectSelectedDarkModeControl( page: Page ) {
	const darkOption = page
		.locator( 'button, [role="radio"]' )
		.filter( { hasText: /^Dark$/ } )
		.first();

	await expect( darkOption ).toBeVisible();
	await expect
		.poll(
			async () =>
				await darkOption.evaluate( ( element ) => {
					const candidates = [ element, element.parentElement ].filter( Boolean ) as Element[];

					return candidates.some(
						( candidate ) =>
							candidate.getAttribute( 'aria-checked' ) === 'true' ||
							candidate.getAttribute( 'aria-pressed' ) === 'true' ||
							candidate.getAttribute( 'data-active' ) === 'true' ||
							candidate.classList.contains( 'is-active' ) ||
							candidate.classList.contains( 'is-pressed' )
					);
				} )
		)
		.toBe( true );
}

test.describe( 'Dashboard dark-mode surface', { tag: [ tags.DASHBOARD_PR ] }, () => {
	test( 'applies shared dark-mode tokens on sites, site overview, and appearance routes', async ( {
		accountGivenByEnvironment,
		page,
		pageDashboard,
	} ) => {
		const assertNoPageIssues = collectPageIssues( page );
		const siteSlug = accountGivenByEnvironment.getSiteURL( { protocol: false } );
		await forceDarkModePreference( page );

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async () => {
			await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
		} );

		await test.step( 'Then the Sites route renders in dark mode', async () => {
			await pageDashboard.visitPath( 'sites' );
			await expect( page.getByRole( 'main' ) ).toBeVisible( { timeout: 30_000 } );
			await expectDarkModeRoot( page );
			await expectSharedDarkTokens( page );
			await expectNoObviousLightSurface( page.getByRole( 'main' ) );
			await expectNoObviousLightSurface(
				await firstVisibleLocator( page, [
					'.components-surface.components-card',
					'.dataviews-wrapper',
					'.dashboard-dataviews-empty-state',
				] )
			);
		} );

		await test.step( 'And the site overview route renders in dark mode', async () => {
			await pageDashboard.visitPath( `sites/${ siteSlug }` );
			await expect( page.getByRole( 'main' ) ).toBeVisible( { timeout: 30_000 } );
			await expectDarkModeRoot( page );
			await expectSharedDarkTokens( page );
			await expectNoObviousLightSurface( page.getByRole( 'main' ) );
			await expectNoObviousLightSurface(
				await firstVisibleLocator( page, [
					'.site-overview-cards .components-card',
					'.site-overview-cards > *',
					'.components-card',
				] )
			);
		} );

		await test.step( 'And the Appearance route keeps the dark control selected', async () => {
			await pageDashboard.visitPath( 'me/preferences/appearance' );
			await page.getByRole( 'heading', { name: 'Appearance' } ).waitFor();
			await expectDarkModeRoot( page );
			await expectSharedDarkTokens( page );
			await expectNoObviousLightSurface( page.getByRole( 'main' ) );
			await expectNoObviousLightSurface(
				page.locator( '.components-surface.components-card' ).first()
			);
			await expectSelectedDarkModeControl( page );
		} );

		assertNoPageIssues();
	} );
} );

test.describe( 'Reader dark-mode surface', { tag: [ tags.CALYPSO_PR ] }, () => {
	test( 'applies shared dark-mode tokens on primary and secondary Reader routes', async ( {
		accountGivenByEnvironment,
		page,
	} ) => {
		const assertNoPageIssues = collectPageIssues( page );
		await forceDarkModePreference( page );

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async () => {
			await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
		} );

		await test.step( 'Then the Reader route renders in dark mode', async () => {
			const readerPage = new ReaderPage( page );
			await readerPage.visit();
			await expectDarkModeRoot( page, {
				bodyClasses: [ 'is-reader-dark-mode' ],
				expectColorSchemeBodyClass: true,
			} );
			await expectSharedDarkTokens( page );
			await expectNoObviousLightSurface(
				await firstVisibleLocator( page, [ '.global-sidebar', '.sidebar' ] )
			);
			await expectNoObviousLightSurface(
				await firstVisibleLocator( page, [
					'.sidebar__menu-link.selected',
					'.sidebar__menu-link',
					'.reader__content',
					'main',
				] )
			);
		} );

		await test.step( 'And a secondary Reader route keeps the dark-mode contract', async () => {
			await page.goto( DataHelper.getCalypsoURL( 'reader/search' ) );
			await expectDarkModeRoot( page, {
				bodyClasses: [ 'is-reader-dark-mode' ],
				expectColorSchemeBodyClass: true,
			} );
			await expectSharedDarkTokens( page );
			await expectNoObviousLightSurface(
				await firstVisibleLocator( page, [ '.reader__content', 'main' ] )
			);
		} );

		assertNoPageIssues();
	} );
} );

test.describe( 'Themes dark-mode surfaces', { tag: [ tags.CALYPSO_PR ] }, () => {
	test( 'applies shared dark-mode tokens on the Themes listing', async ( {
		accountGivenByEnvironment,
		page,
		pageThemes,
	} ) => {
		const assertNoPageIssues = collectPageIssues( page );
		await forceDarkModePreference( page );

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async () => {
			await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
		} );

		await test.step( 'Then the Themes listing renders in dark mode', async () => {
			await pageThemes.visitShowcase();
			await expect( page.getByRole( 'heading', { name: /Find the perfect theme/ } ) ).toBeVisible( {
				timeout: 30_000,
			} );
			await expectDarkModeRoot( page, {
				bodyClasses: [ 'is-themes-dark-mode' ],
				expectColorSchemeBodyClass: true,
			} );
			await expectSharedDarkTokens( page );
			await expectNoObviousLightSurface( page.locator( '.themes__content' ).first() );
			await expectNoObviousLightSurface(
				await firstVisibleLocator( page, [
					'.themes-magic-search',
					'.filter-bar-modern',
					'.theme__search-container',
				] )
			);
			await expectNoObviousLightSurface( page.locator( '.theme-card' ).first() );
		} );

		await test.step( 'And the Help Center shell inherits the dark-mode tokens', async () => {
			const helpCenter = new HelpCenterComponent( page );
			await helpCenter.openPopover();
			await expectNoObviousLightSurface( helpCenter.getHelpCenterLocator() );
		} );

		assertNoPageIssues();
	} );

	test( 'applies shared dark-mode tokens on Theme detail pages', async ( {
		accountGivenByEnvironment,
		page,
		pageThemeDetails,
	} ) => {
		const assertNoPageIssues = collectPageIssues( page );
		await forceDarkModePreference( page );

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async () => {
			await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
		} );

		await test.step( 'Then the Primarium detail route renders download and support cards in dark mode', async () => {
			await pageThemeDetails.visitTheme( 'primarium' );
			await waitForThemesDarkModeReady( page );
			await page.locator( '.theme-download-card' ).waitFor( { timeout: 30_000 } );
			await expectDarkModeRoot( page, {
				bodyClasses: [ 'is-themes-dark-mode' ],
				expectColorSchemeBodyClass: true,
			} );
			await expectSharedDarkTokens( page );
			await expectNoObviousLightSurface( page.locator( '.theme-download-card .action-list' ) );
			await expectNoObviousLightSurface( page.locator( '.theme__sheet-content > .action-list' ) );
		} );

		await test.step( 'And the Lente detail route keeps premium badge colors dark-compatible', async () => {
			await pageThemeDetails.visitTheme( 'lente' );
			await waitForThemesDarkModeReady( page );
			await page.locator( '.premium-badge' ).first().waitFor( { timeout: 30_000 } );
			await expectDarkModeRoot( page, {
				bodyClasses: [ 'is-themes-dark-mode' ],
				expectColorSchemeBodyClass: true,
			} );
			await expectSharedDarkTokens( page );
			await expectNoObviousLightSurface( page.locator( '.theme__sheet-content' ).first() );
			await expectNoObviousLightSurface( page.locator( '.premium-badge' ).first() );
		} );

		assertNoPageIssues();
	} );
} );
