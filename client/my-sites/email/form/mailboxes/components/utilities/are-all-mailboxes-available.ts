import {
	checkMailboxAvailability,
	decorateMailboxWithAvailabilityError,
} from 'calypso/lib/titan/new-mailbox';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { FIELD_DOMAIN, FIELD_MAILBOX } from 'calypso/my-sites/email/form/mailboxes/constants';
import type { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';

const areAllTheMailboxesAvailable = async ( mailboxes: MailboxForm< EmailProvider >[] ) => {
	const promisifiedResponses = Promise.all(
		mailboxes.map( ( mailbox ) =>
			checkMailboxAvailability(
				mailbox.getFieldValue< string >( FIELD_DOMAIN ),
				mailbox.getFieldValue< string >( FIELD_MAILBOX )
			)
		)
	);
	const responses = await promisifiedResponses;
	const checks = responses.map( ( { message, status }, index ) => {
		return { available: status === 200, message, mailbox: mailboxes[ index ] };
	} );
	checks
		.filter( ( { available } ) => ! available )
		.forEach( ( { mailbox, message } ) =>
			decorateMailboxWithAvailabilityError( mailbox, message )
		);
	const result = checks.every( ( { available } ) => available );
	if ( ! result && onMailboxesChange ) {
		onMailboxesChange( mailboxes );
	}
	return result;
};

export default areAllTheMailboxesAvailable;
