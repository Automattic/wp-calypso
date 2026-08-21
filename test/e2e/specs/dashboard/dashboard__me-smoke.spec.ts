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
				'Account',
				'Preferences',
				'Billing',
				'Security',
				'Notifications',
				'Apps',
			] as const;

			for ( const target of meEndpoints ) {
				await test.step( `Then I can navigate to Me > ${ target }`, async function () {
					await componentDashboardMeSidebar.openMobileMenu();
					await componentDashboardMeSidebar.navigate( target );

					await expect( page ).toHaveURL( new RegExp( `/me/${ target.toLowerCase() }` ) );
					await expect(
						page.getByRole( 'main' ).getByRole( 'heading', { name: target, exact: true, level: 1 } )
					).toBeVisible();
				} );
			}
		} );
	}
);
