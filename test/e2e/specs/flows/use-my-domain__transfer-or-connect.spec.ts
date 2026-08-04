import {
	DataHelper,
	DomainSearchComponent,
	NewsletterGoalsPage,
	NewsletterSetupPage,
	UseADomainIOwnPage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';
import { tags, test, expect } from '../../lib/pw-base';

/**
 * A domain that is already registered (i.e. not available for purchase) so that submitting
 * it on the "use my domain" step routes to the transfer-or-connect chooser.
 *
 * NOTE: verify this is a suitable owned/registered domain for the test environment before
 * relying on it — the step hits the real domain-availability API.
 */
const OWNED_DOMAIN = 'dev-testing.com';

/**
 * Shared assertion: from a flow's domain search step, choose "Already have a domain?",
 * enter an owned domain, and confirm we land on the transfer-or-connect screen.
 *
 * This is the exact segment that regressed: a leading slash in the flow's redirect made
 * the router bounce the user back to the `domains` step instead of `use-my-domain`.
 */
async function assertLandsOnTransferOrConnect(
	page: Page,
	componentDomainSearch: DomainSearchComponent,
	pageUseADomainIAlreadyOwn: UseADomainIOwnPage,
	ownedDomain: string
): Promise< void > {
	await test.step( 'When I choose "Already have a domain?" and submit an owned domain', async () => {
		await componentDomainSearch.clickUseADomainIAlreadyOwn();
		await pageUseADomainIAlreadyOwn.fillUseDomainIOwnInput( ownedDomain );
	} );

	await test.step( 'Then I land on the transfer-or-connect screen (not bounced back to domains)', async () => {
		// Regression guard: the bug changed this URL to `.../domains?step=transfer-or-connect`.
		await expect( page ).toHaveURL( /\/use-my-domain\?.*step=transfer-or-connect/ );
		await pageUseADomainIAlreadyOwn.validateButtonToTransferDomain();
		await pageUseADomainIAlreadyOwn.validateButtonToConnectDomain();
	} );
}

test.describe(
	DataHelper.createSuiteTitle( 'Use My Domain: transfer-or-connect renders across flows' ),
	{ tag: [ tags.CALYPSO_PR ] },
	() => {
		test( 'Onboarding flow shows transfer-or-connect after entering an owned domain', async ( {
			page,
			accountDefaultUser,
			componentDomainSearch,
			pageUseADomainIAlreadyOwn,
		} ) => {
			await test.step( 'Given I am authenticated', async () => {
				await accountDefaultUser.authenticate( page );
			} );

			await test.step( 'And I am on the onboarding domains step', async () => {
				await page.goto( DataHelper.getCalypsoURL( '/setup/onboarding/domains' ) );
			} );

			await assertLandsOnTransferOrConnect(
				page,
				componentDomainSearch,
				pageUseADomainIAlreadyOwn,
				OWNED_DOMAIN
			);
		} );

		test( 'Newsletter flow shows transfer-or-connect after entering an owned domain', async ( {
			page,
			accountDefaultUser,
			componentDomainSearch,
			pageUseADomainIAlreadyOwn,
		} ) => {
			await test.step( 'Given I am authenticated', async () => {
				await accountDefaultUser.authenticate( page );
			} );

			await test.step( 'And I walk the newsletter preamble to the domains step', async () => {
				await page.goto( DataHelper.getCalypsoURL( '/setup/newsletter' ) );
				await new NewsletterSetupPage( page ).enterNameAndContinue( DataHelper.getBlogName() );
				await new NewsletterGoalsPage( page ).selectFreeNewsletter();
			} );

			await assertLandsOnTransferOrConnect(
				page,
				componentDomainSearch,
				pageUseADomainIAlreadyOwn,
				OWNED_DOMAIN
			);
		} );

		test( 'Reblogging flow shows transfer-or-connect after entering an owned domain', async ( {
			page,
			accountDefaultUser,
			componentDomainSearch,
			pageUseADomainIAlreadyOwn,
		} ) => {
			await test.step( 'Given I am authenticated', async () => {
				await accountDefaultUser.authenticate( page );
			} );

			await test.step( 'And I am on the reblogging domains step', async () => {
				await page.goto( DataHelper.getCalypsoURL( '/setup/reblogging' ) );
			} );

			await assertLandsOnTransferOrConnect(
				page,
				componentDomainSearch,
				pageUseADomainIAlreadyOwn,
				OWNED_DOMAIN
			);
		} );

		test( 'Domain-and-plan flow shows transfer-or-connect after entering an owned domain', async ( {
			page,
			accountAtomic,
			componentDomainSearch,
			pageUseADomainIAlreadyOwn,
		} ) => {
			await test.step( 'Given I am authenticated with a site', async () => {
				await accountAtomic.authenticate( page );
			} );

			await test.step( 'And I am on the domain-and-plan domains step', async () => {
				const siteSlug = accountAtomic.getSiteURL( { protocol: false } );
				await page.goto( DataHelper.getCalypsoURL( '/setup/domain-and-plan', { siteSlug } ) );
			} );

			await assertLandsOnTransferOrConnect(
				page,
				componentDomainSearch,
				pageUseADomainIAlreadyOwn,
				OWNED_DOMAIN
			);
		} );
	}
);
