import config from 'config';
import EnterADomainComponent from '../../lib/components/enter-a-domain-component';
import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverManager from '../../lib/driver-manager.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import MyOwnDomainPage from '../../lib/pages/domain-my-own-page';
import DomainsPage from '../../lib/pages/domains-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe.skip( `[${ host }] Manage Domains - Map a Domain: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	const blogName = 'nature.com';

	before( 'Log in and go to Domains page', async function () {
		await new LoginFlow( this.driver ).loginAndSelectDomains();
	} );

	it( 'Add a domain', async function () {
		const domainsPage = await DomainsPage.Expect( this.driver );
		await domainsPage.clickAddDomain();
		await domainsPage.clickPopoverItem( 'to this site' );
	} );

	it( 'Use own domain', async function () {
		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.selectUseOwnDomain();
	} );

	it( 'Buy domain mapping', async function () {
		const myOwnDomainPage = await MyOwnDomainPage.Expect( this.driver );
		await myOwnDomainPage.selectBuyDomainMapping();
	} );

	it( 'Enter domain name', async function () {
		const enterADomainComponent = await EnterADomainComponent.Expect( this.driver );
		await enterADomainComponent.enterADomain( blogName );
	} );
} );
