import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes/index';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

export class MailboxOperations {
	public mailboxes: MailboxForm< EmailProvider >[];
	private readonly setMailboxesState: () => void;

	constructor( mailboxes: MailboxForm< EmailProvider >[], setMailboxesState: () => void ) {
		this.mailboxes = mailboxes;
		this.setMailboxesState = setMailboxesState;
	}

	validateAll() {
		this.mailboxes.forEach( ( mailbox ) => {
			mailbox.validate( true );
		} );
	}

	async validateOnDemand() {
		await Promise.all( this.mailboxes.map( ( mailbox ) => mailbox.validateOnDemand() ) );
	}

	areAllValid() {
		return this.mailboxes.every( ( mailbox ) => mailbox.isValid() );
	}

	persistMailboxesToState() {
		this.setMailboxesState();
	}
}
