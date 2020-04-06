/**
 * External dependencies
 */
//import assert from 'assert';

/**
 * Internal dependencies
 */
import SignupProcessingPage from '../pages/signup/signup-processing-page';
import FindADomainComponent from '../components/find-a-domain-component';

export default class SignUpStep {
	constructor( driver ) {
		this.driver = driver;
	}

	async continueAlong( blogName, passwordForTestAccounts ) {
		if ( global.browserName === 'Internet Explorer' ) {
			return;
		}
		const signupProcessingPage = await SignupProcessingPage.Expect( this.driver );
		return await signupProcessingPage.waitToDisappear( blogName, passwordForTestAccounts );
	}

	// eslint-disable-next-line no-unused-vars
	async selectFreeWordPressDotComAddresss( blogName, expectedBlogAddresses ) {
		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
		// See https://github.com/Automattic/wp-calypso/pull/38641/
		//await findADomainComponent.checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName );
		//const actualAddress = await findADomainComponent.freeBlogAddress();
		//assert(
		//	expectedBlogAddresses.indexOf( actualAddress ) > -1,
		//	`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
		//);

		return await findADomainComponent.selectFreeAddress();
	}
}
