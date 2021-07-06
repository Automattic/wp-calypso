/**
 * Internal dependencies
 */
import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';

import LoginFlow from '../../lib/flows/login-flow.js';
import DomainsPage from '../../lib/pages/domains-page.js';
import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import MyOwnDomainPage from '../../lib/pages/domain-my-own-page';
import EnterADomainComponent from '../../lib/components/enter-a-domain-component';

const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Manage Domains - Map a Domain: (${ screenSize }) @parallel`, function () {
	let driver;

	beforeAll( () => ( driver = global.__BROWSER__ ) );

	const blogName = 'nature.com';

	beforeAll( async function () {
		await new LoginFlow( driver ).loginAndSelectDomains();
	} );

	it( 'Add a domain', async function () {
		const domainsPage = await DomainsPage.Expect( driver );
		await domainsPage.clickAddDomain();
		await domainsPage.clickPopoverItem( 'to this site' );
	} );

	it( 'Use own domain', async function () {
		const findADomainComponent = await FindADomainComponent.Expect( driver );
		await findADomainComponent.selectUseOwnDomain();
	} );

	it( 'Buy domain mapping', async function () {
		const myOwnDomainPage = await MyOwnDomainPage.Expect( driver );
		await myOwnDomainPage.selectBuyDomainMapping();
	} );

	it( 'Enter domain name', async function () {
		const enterADomainComponent = await EnterADomainComponent.Expect( driver );
		await enterADomainComponent.enterADomain( blogName );
	} );
} );
