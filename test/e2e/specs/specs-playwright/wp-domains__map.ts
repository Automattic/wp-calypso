/**
 * @group calypso-pr
 */
import {
	DataHelper,
	LoginPage,
	DomainsPage,
	SidebarComponent,
	setupHooks,
	UseADomainIOwnPage,
} from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Domains: Map/Connect a Domain' ), function () {
	let page: Page;
	let useADomainIOwnPage: UseADomainIOwnPage;

	// We have to find a domain that a) is actually registered and b) won't be on another WordPress site
	// THe easiest way to do that is to use a unique subdomain of the IANA reserved example.com domain!
	const fakeOwnedDomain = `e2eflowtesting${ DataHelper.getTimestamp() }.example.com`;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	it( 'Log in', async function () {
		const loginPage = new LoginPage( page );
		await loginPage.login( { account: 'defaultUser' } );
	} );

	it( 'Navigate to Upgrades > Domains', async function () {
		const sidebarComponent = new SidebarComponent( page );
		await sidebarComponent.navigate( 'Upgrades', 'Domains' );
	} );

	it( 'Select to use an already owned domain', async function () {
		const domainsPage = new DomainsPage( page );
		await domainsPage.useADomainIOwn();
	} );

	it( 'Search for and select an existing domain', async function () {
		useADomainIOwnPage = new UseADomainIOwnPage( page );
		await useADomainIOwnPage.search( fakeOwnedDomain );
	} );

	it( 'See options to connect or transfer domain', async function () {
		await page.waitForSelector( 'text=Connect your domain' );
		await page.waitForSelector( 'text=Transfer your domain' );
	} );

	it( 'Button to connect domain is active and enabled', async function () {
		await useADomainIOwnPage.validateButtonToConnectDomain();
	} );
} );
