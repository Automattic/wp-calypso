import { expect, tags, test } from '../../lib/pw-base';

interface PerfNavEvent {
	id: string;
	duration: number;
	fullPage: boolean;
	[ key: string ]: unknown;
}

/**
 * Try to extract perf.nav properties from a logstash POST body.
 * The body comes from the rest-proxy iframe and can be form-encoded or JSON.
 */
function parsePerfNavEvent( body: string ): PerfNavEvent | null {
	let paramsStr: string | null = null;

	// Try form-encoded: params=<url-encoded JSON>
	try {
		paramsStr = new URLSearchParams( body ).get( 'params' );
	} catch {
		// ignore
	}

	// Try JSON body: { "params": "<JSON string>" }
	if ( ! paramsStr ) {
		try {
			const json = JSON.parse( body );
			paramsStr = typeof json.params === 'string' ? json.params : null;
		} catch {
			// ignore
		}
	}

	if ( ! paramsStr ) {
		return null;
	}

	try {
		const parsed = JSON.parse( paramsStr );
		if ( parsed.message === 'perf.nav' && parsed.properties ) {
			return parsed.properties as PerfNavEvent;
		}
	} catch {
		// ignore
	}

	return null;
}

test.describe( 'Dashboard: RUM Performance Tracking', { tag: [ tags.DASHBOARD_PR ] }, () => {
	/**
	 * Observes logstash requests and returns a collector array.
	 * Uses page.on('request') because wpcom-proxy-request sends through a cross-origin
	 * iframe (public-api.wordpress.com), which page.route() cannot intercept.
	 */
	function observeLogstash( page: import('playwright').Page ): PerfNavEvent[] {
		const events: PerfNavEvent[] = [];

		page.on( 'request', ( request ) => {
			if ( request.url().includes( '/logstash' ) && request.method() === 'POST' ) {
				const body = request.postData();
				if ( body ) {
					const event = parsePerfNavEvent( body );
					if ( event ) {
						events.push( event );
					}
				}
			}
		} );

		return events;
	}

	test( 'Full page load to site list sends perf.nav with correct ID', async ( {
		accountGivenByEnvironment,
		page,
		pageDashboard,
	} ) => {
		const events = observeLogstash( page );

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
		} );

		await test.step( 'When I navigate directly to the sites page', async function () {
			await pageDashboard.visit();
		} );

		await test.step( 'Then a perf.nav event is sent for /sites', async function () {
			await expect
				.poll( () => events.find( ( e ) => e.id === '/sites' ), {
					timeout: 15000,
					message: 'Expected logstash request with id "/sites"',
				} )
				.toBeTruthy();

			const event = events.find( ( e ) => e.id === '/sites' )!;
			expect( event.duration ).toBeGreaterThan( 0 );
			expect( event.fullPage ).toBe( true );
		} );
	} );

	test( 'In-app navigation sends perf.nav with fullPage false', async ( {
		accountGivenByEnvironment,
		page,
		pageDashboard,
		viewportName,
	} ) => {
		const events = observeLogstash( page );

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
		} );

		await test.step( 'And I am on the sites page', async function () {
			await pageDashboard.visit();
			// Wait for the site list tracking to fire first
			await expect
				.poll( () => events.find( ( e ) => e.id === '/sites' ), {
					timeout: 15000,
				} )
				.toBeTruthy();
		} );

		await test.step( 'When I navigate in-app to the domains page', async function () {
			// The dashboard/omnibar feature flag changes the navigation structure.
			// Detect it by the presence of `#wpcom-omnibar`, the hydration root.
			const isOmnibarEnabled = ( await page.locator( '#wpcom-omnibar' ).count() ) > 0;

			if ( isOmnibarEnabled ) {
				// With omnibar: click Domains in the responsive sidebar.
				// On mobile, open the sidebar first via the masterbar menu button.
				if ( viewportName === 'mobile' ) {
					await page.getByRole( 'button', { name: 'Menu', exact: true } ).click();
				}
				await page.getByRole( 'link', { name: 'Domains' } ).click();
			} else if ( viewportName === 'mobile' ) {
				await page.getByRole( 'button', { name: 'Menu' } ).click();
				await page
					.getByRole( 'link', { name: 'Domains' } )
					.or( page.getByRole( 'menuitem', { name: 'Domains' } ) )
					.click();
			} else {
				await page.getByRole( 'link', { name: 'Domains' } ).click();
			}
			await page.waitForURL( /domains$/ );
		} );

		await test.step( 'Then a perf.nav event is sent for /domains with fullPage false', async function () {
			await expect
				.poll( () => events.find( ( e ) => e.id === '/domains' ), {
					timeout: 15000,
					message: 'Expected logstash request with id "/domains"',
				} )
				.toBeTruthy();

			const event = events.find( ( e ) => e.id === '/domains' )!;
			expect( event.duration ).toBeGreaterThan( 0 );
			expect( event.fullPage ).toBe( false );
		} );
	} );
} );
