import {
	BrowserManager,
	CartCheckoutPage,
	PlansPage,
	PluginsPage,
	RestAPIClient,
	SecretsManager,
	TestAccount,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';

test.describe( 'Plugins: Add multiple to cart', { tag: [ tags.CALYPSO_RELEASE ] }, () => {
	const credentials = SecretsManager.secrets.testAccounts.simpleSiteFreePlanUser;
	const plugin1Name = 'Sensei Pro';
	const plugin2Name = 'AutomateWoo';

	test.afterAll( async () => {
		const restAPIClient = new RestAPIClient( credentials );
		await restAPIClient.clearShoppingCart( credentials.testSites?.primary?.id as number );
	} );

	test( 'As a user, I can add multiple plugins to the cart', async ( { page } ) => {
		let pluginsPage: PluginsPage;
		let cartCheckoutPage: CartCheckoutPage;
		let testAccount: TestAccount;

		await test.step( 'Setup: authenticate and clear cart', async () => {
			testAccount = new TestAccount( 'simpleSiteFreePlanUser' );
			await testAccount.authenticate( page );

			const restAPIClient = new RestAPIClient( testAccount.credentials );
			await restAPIClient.clearShoppingCart(
				testAccount.credentials.testSites?.primary.id as number
			);

			await BrowserManager.setStoreCookie( page );
			pluginsPage = new PluginsPage( page );
		} );

		for ( const pluginName of [ plugin1Name, plugin2Name ] ) {
			await test.step( `Go to plugins page for ${ pluginName }`, async () => {
				await pluginsPage.visitPage(
					pluginName.toLowerCase().replace( ' ', '-' ),
					testAccount.credentials.testSites?.primary.url
				);
			} );

			await test.step( `Click on install button for ${ pluginName }`, async () => {
				await pluginsPage.clickInstallPlugin();
			} );

			await test.step( `Select a plan on the plans page for ${ pluginName }`, async () => {
				const plansPage = new PlansPage( page );
				await plansPage.selectPlan( 'Personal' );
			} );

			await test.step( `WordPress.com is added to cart after adding ${ pluginName }`, async () => {
				cartCheckoutPage = new CartCheckoutPage( page );
				await cartCheckoutPage.validateCartItem( 'WordPress.com' );
			} );

			await test.step( `${ pluginName } is added to cart`, async () => {
				await cartCheckoutPage.validateCartItem( pluginName );
			} );
		}
	} );
} );
