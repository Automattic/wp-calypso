import i18n from 'i18n-calypso';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { FIELD_MAILBOX, FIELD_UUID } from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

export class MailboxOperations {
	public mailboxes: MailboxForm< EmailProvider >[];
	private readonly setMailboxesState: () => void;

	constructor( mailboxes: MailboxForm< EmailProvider >[], setMailboxesState: () => void ) {
		this.mailboxes = mailboxes;
		this.setMailboxesState = setMailboxesState;
	}

	validateLocal() {
		this.mailboxes.forEach( ( mailbox ) => {
			const otherMailboxNames = this.mailboxes
				.filter(
					( currentMailbox ) =>
						currentMailbox.getFieldValue( FIELD_UUID ) !== mailbox.getFieldValue( FIELD_UUID )
				)
				.map( ( mailbox ) => mailbox.getFieldValue< string >( FIELD_MAILBOX ) ?? '' );

			mailbox.validate(
				false,
				mailbox.getPreviouslySpecifiedMailboxNameValidators( otherMailboxNames )
			);
		} );
	}

	async validateForExtraItemsPurchase() {
		await Promise.all( this.mailboxes.map( ( mailbox ) => mailbox.validateOnDemand() ) );
	}

	areAllValuesValid() {
		return this.mailboxes.every( ( mailbox ) => mailbox.isValid() );
	}

	persistMailboxesToState() {
		this.setMailboxesState();
	}

	public async validateAndCheck( isExtraItemPurchase: boolean ) {
		this.validateLocal();

		if ( ! this.areAllValuesValid() ) {
			return false;
		}

		if ( ! isExtraItemPurchase ) {
			return true;
		}

		try {
			await this.validateForExtraItemsPurchase();
		} catch ( e ) {
			this.mailboxes[ 0 ].formFields.mailbox.error = i18n.translate( 'An unknown error occurred' );
		}

		this.persistMailboxesToState();

		return this.areAllValuesValid();
	}
}
