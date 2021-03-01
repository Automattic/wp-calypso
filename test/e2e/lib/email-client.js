/**
 * External dependencies
 */
import webdriver from 'selenium-webdriver';
import config from 'config';

const emailWaitMS = config.get( 'emailWaitMS' );

export default class EmailClient {
	constructor( mailboxId ) {
		const apiKey = config.get( 'mailosaurAPIKey' );
		const Mailosaur = require( 'mailosaur' )( apiKey, 'https://mailosaur.com/api/' );
		this.mailbox = new Mailosaur.Mailbox( mailboxId );
	}

	async deleteAllEmailByID( emailID ) {
		return await new Promise( ( resolve, reject ) => {
			this.mailbox.deleteEmail( emailID, ( err ) => {
				if ( err ) {
					reject();
				} else {
					resolve();
				}
			} );
		} );
	}

	deleteAllEmail() {
		const d = webdriver.promise.defer();
		this.mailbox.deleteAllEmail( ( err ) => {
			if ( err ) {
				d.reject( err );
			} else {
				d.fulfill();
			}
		} );
		return d.promise;
	}

	/**
	 * Load emails for specific email address.
	 * It is possible to pass an optional function which will return list of emails only if validator will return "true"
	 * It's possible to pass a function to validate received emails. For example when you waiting for specific email - validator may check if expected email is present
	 *
	 * @param {string} emailAddress - Email address from where to get emails
	 * @param {Function} validator - Optional function to validate received emails
	 * @returns {object} - Returns `object`
	 */
	async pollEmailsByRecipient( emailAddress, validator = ( emails ) => emails.length > 0 ) {
		const intervalMS = 1500;
		let retries = emailWaitMS / intervalMS;
		let emails;

		while ( retries > 0 ) {
			emails = await this.mailbox.getEmailsByRecipient( emailAddress );
			if ( validator( emails ) ) {
				return emails;
			}
			await this.resolveAfterTimeout( intervalMS );
			retries--;
		}
		throw new Error( `Could not locate email for '${ emailAddress }' in '${ emailWaitMS }'ms` );
	}

	resolveAfterTimeout( timeout ) {
		return new Promise( ( resolved ) => {
			setTimeout( () => {
				resolved( 'resolved' );
			}, timeout );
		} );
	}
}
