/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import StartPage from '../pages/signup/start-page';
import CreateYourAccountPage from '../pages/signup/create-your-account-page';
import SignupProcessingPage from '../pages/signup/signup-processing-page';

import * as driverManager from '../driver-manager';
import * as dataHelper from '../data-helper';

import EmailClient from '../email-client';
import ReaderPage from '../pages/reader-page';

const signupInboxId = config.get( 'signupInboxId' );

export default class SignUpFlow {
	constructor( driver, { accountName, emailAddress, password } ) {
		this.driver = driver;
		this.emailClient = new EmailClient( signupInboxId );

		this.accountName = accountName || dataHelper.getNewBlogName();
		this.emailAddress =
			emailAddress || dataHelper.getEmailAddress( this.accountName, signupInboxId );
		this.password = password || config.get( 'passwordForNewTestSignUps' );
	}

	async signupFreeAccount() {
		await driverManager.ensureNotLoggedIn( this.driver );
		global.__TEMPJETPACKHOST__ = 'WPCOM';
		await StartPage.Visit( this.driver, StartPage.getStartURL( { flow: 'account' } ) );
		const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
		await createYourAccountPage.enterAccountDetailsAndSubmit(
			this.emailAddress,
			this.accountName,
			this.password
		);
		const signupProcessingPage = await SignupProcessingPage.Expect( this.driver );
		await signupProcessingPage.waitToDisappear( this.accountName, this.password );
		const readerPage = await ReaderPage.Expect( this.driver );
		await readerPage.displayed();
		global.__TEMPJETPACKHOST__ = false;
	}

	async activateAccount() {
		let activationLink;
		const emails = await this.emailClient.pollEmailsByRecipient( this.emailAddress );
		for ( const email of emails ) {
			if ( email.subject.indexOf( 'Activate' ) > -1 ) {
				activationLink = email.html.links[ 0 ].href;
			}
		}
		await this.driver.get( activationLink );
		const readerPage = await ReaderPage.Expect( this.driver );
		return await readerPage.waitForPage();
	}
}
