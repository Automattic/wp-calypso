/** @format */

import assert from 'assert';

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

	async selectFreeWordPressDotComAddresss( blogName, expectedBlogAddresses ) {
		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
		await findADomainComponent.checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName );
		let actualAddress = await findADomainComponent.freeBlogAddress();
		assert(
			expectedBlogAddresses.indexOf( actualAddress ) > -1,
			`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
		);

		return await findADomainComponent.selectFreeAddress();
	}
}
