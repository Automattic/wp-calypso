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

		await test.step( 'Then a perf.nav event is sent for dashboard-site-list', async function () {
			await expect
				.poll( () => events.find( ( e ) => e.id === 'dashboard-site-list' ), {
					timeout: 15000,
					message: 'Expected logstash request with id "dashboard-site-list"',
				} )
				.toBeTruthy();

			const event = events.find( ( e ) => e.id === 'dashboard-site-list' )!;
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
				.poll( () => events.find( ( e ) => e.id === 'dashboard-site-list' ), {
					timeout: 15000,
				} )
				.toBeTruthy();
		} );

		await test.step( 'When I navigate in-app to the plugins page', async function () {
			if ( viewportName === 'mobile' ) {
				await page.getByRole( 'button', { name: 'Menu' } ).click();
				await page.getByRole( 'menuitem', { name: 'Plugins' } ).click();
			} else {
				await page.getByRole( 'link', { name: 'Plugins' } ).click();
			}
			await page.waitForURL( /\/plugins\/manage/ );
		} );

		await test.step( 'Then a perf.nav event is sent for dashboard-plugin-list with fullPage false', async function () {
			await expect
				.poll( () => events.find( ( e ) => e.id === 'dashboard-plugin-list' ), {
					timeout: 15000,
					message: 'Expected logstash request with id "dashboard-plugin-list"',
				} )
				.toBeTruthy();

			const event = events.find( ( e ) => e.id === 'dashboard-plugin-list' )!;
			expect( event.duration ).toBeGreaterThan( 0 );
			expect( event.fullPage ).toBe( false );
		} );
	} );

	test( 'Direct navigation to me/profile sends perf.nav', async ( {
		accountGivenByEnvironment,
		page,
		pageDashboard,
	} ) => {
		const events = observeLogstash( page );

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
		} );

		await test.step( 'When I navigate directly to the profile page', async function () {
			await pageDashboard.visitPath( 'me/profile' );
		} );

		await test.step( 'Then a perf.nav event is sent for dashboard-me-profile', async function () {
			await expect
				.poll( () => events.find( ( e ) => e.id === 'dashboard-me-profile' ), {
					timeout: 15000,
					message: 'Expected logstash request with id "dashboard-me-profile"',
				} )
				.toBeTruthy();

			const event = events.find( ( e ) => e.id === 'dashboard-me-profile' )!;
			expect( event.duration ).toBeGreaterThan( 0 );
		} );
	} );

	test( 'Direct navigation to plugins sends perf.nav', async ( {
		accountGivenByEnvironment,
		page,
		pageDashboard,
	} ) => {
		const events = observeLogstash( page );

		await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
			await accountGivenByEnvironment.authenticate( page, { waitUntilStable: false } );
		} );

		await test.step( 'When I navigate directly to the plugins page', async function () {
			await pageDashboard.visitPath( 'plugins/manage' );
		} );

		await test.step( 'Then a perf.nav event is sent for dashboard-plugin-list', async function () {
			await expect
				.poll( () => events.find( ( e ) => e.id === 'dashboard-plugin-list' ), {
					timeout: 15000,
					message: 'Expected logstash request with id "dashboard-plugin-list"',
				} )
				.toBeTruthy();

			const event = events.find( ( e ) => e.id === 'dashboard-plugin-list' )!;
			expect( event.duration ).toBeGreaterThan( 0 );
		} );
	} );
} );
