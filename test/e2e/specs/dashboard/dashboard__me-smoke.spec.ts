import { snoozeAccountRecoveryInterstitial } from '../../lib/dashboard-helpers';
import { expect, tags, test } from '../../lib/pw-base';

/**
 * Verifies the /me endpoint is functional.
 *
 * See: https://github.com/Automattic/wp-calypso/issues/76266
 */
test.describe(
	'Dashboard: Me Smoke Test',
	{ tag: [ tags.DASHBOARD_PR, tags.CALYPSO_RELEASE ] },
	() => {
		test( 'Navigate to Me pages', async ( {
			accountGivenByEnvironment,
			clientRestAPI,
			componentDashboardMeSidebar,
			page,
			pageDashboard,
		} ) => {
			await test.step( `Given I am authenticated as '${ accountGivenByEnvironment.accountName }'`, async function () {
				await snoozeAccountRecoveryInterstitial( clientRestAPI );
				await accountGivenByEnvironment.authenticate( page );
			} );

			await test.step( 'When I navigate to /me', async function () {
				await pageDashboard.visitPath( 'me' );
				await pageDashboard.dismissWelcomeModal();
			} );

			const meEndpoints = [
				{ label: 'Account', path: 'account' },
				{ label: 'Preferences', path: 'preferences' },
				{ label: 'Billing', path: 'billing' },
				{ label: 'Security', path: 'security' },
				{ label: 'Notifications', path: 'notifications' },
				{ label: 'Apps', path: 'apps' },
			] as const;

			for ( const target of meEndpoints ) {
				await test.step( `Then I can navigate to Me > ${ target.label }`, async function () {
					await componentDashboardMeSidebar.openMobileMenu();
					await componentDashboardMeSidebar.navigate( target.label );

					await expect( page ).toHaveURL( new RegExp( `/me/${ target.path }` ) );
					await expect(
						page
							.getByRole( 'main' )
							.getByRole( 'heading', { name: target.label, exact: true, level: 1 } )
					).toBeVisible();
				} );
			}
		} );
	}
);
