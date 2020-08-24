/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import EmailClient from '../email-client';

const signupInboxId = config.get( 'signupInboxId' );

export default class LaunchSiteFlow {
	constructor( driver, emailAddress ) {
		this.driver = driver;
		this.emailAddress = emailAddress;
	}

	async activateAccount() {
		let activationLink;
		const emails = await new EmailClient( signupInboxId ).pollEmailsByRecipient(
			this.emailAddress
		);
		for ( const email of emails ) {
			if ( email.subject.indexOf( 'Activate' ) > -1 ) {
				activationLink = email.html.links[ 0 ].href;
			}
		}
		await this.driver.get( activationLink );
	}
}
