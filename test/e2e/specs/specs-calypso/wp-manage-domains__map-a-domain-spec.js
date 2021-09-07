import config from 'config';
import FindADomainComponent from '../../lib/components/find-a-domain-component.js';
import * as dataHelper from '../../lib/data-helper.js';
import * as driverManager from '../../lib/driver-manager.js';
import LoginFlow from '../../lib/flows/login-flow.js';
import MyOwnDomainPage from '../../lib/pages/domain-my-own-page';
import DomainsPage from '../../lib/pages/domains-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

describe( `[${ host }] Manage Domains - Map a Domain: (${ screenSize }) @parallel`, function () {
	this.timeout( mochaTimeOut );

	const domainToMap = 'nature.com';

	before( 'Log in and go to Domains page', async function () {
		await new LoginFlow( this.driver ).loginAndSelectDomains();
	} );

	it( 'Add a domain', async function () {
		const domainsPage = await DomainsPage.Expect( this.driver );
		await domainsPage.clickAddDomain();
	} );

	it( 'Use own domain', async function () {
		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.selectUseOwnDomain();
	} );

	it( 'Buy domain mapping', async function () {
		const myOwnDomainPage = await MyOwnDomainPage.Expect( this.driver );
		await myOwnDomainPage.selectAddDomainMapping( domainToMap );
	} );
} );
