import { sprintf } from '@wordpress/i18n';
import emailValidator from 'email-validator';
import type { ValidationError } from './types';
import type { EmailAccountEmail } from 'calypso/data/emails/types';

export function isValidMailbox( mailbox: string ) {
	const allowedSpecialChars = "!#$%&'*+/=?^_`{|}~.";

	if ( mailbox.length === 0 || mailbox.length > 64 ) {
		return false;
	}

	if ( mailbox.length > 64 ) {
		return false;
	}

	for ( const char of mailbox ) {
		if ( ! /[a-zA-Z0-9]/.test( char ) && ! allowedSpecialChars.includes( char ) ) {
			return false;
		}
	}

	if ( /\.{2,}/.test( mailbox ) || mailbox.startsWith( '.' ) || mailbox.endsWith( '.' ) ) {
		return false;
	}

	return true;
}

export function isValidDestination(
	value: string,
	selectedDomainName: string,
	mailbox: string,
	existingForwardsForMailbox: EmailAccountEmail[],
	translate: ( key: string ) => string
): ValidationError | boolean {
	const valid = emailValidator.validate( value );
	const duplicate = existingForwardsForMailbox.find( ( e ) => e.target === value );
	const sameDomain = value.endsWith( `@${ selectedDomainName }` );
	if ( valid ) {
		if ( duplicate ) {
			return {
				severity: 'warning',
				message: sprintf(
					/* translators: %s: email address %s: email address */
					translate( 'There is already a forward from (%1$s) to (%2$s).' ),
					`${ mailbox }@${ selectedDomainName }`,
					value
				),
			};
		}
		if ( sameDomain ) {
			return {
				severity: 'warning',
				message: translate( 'You cannot forward to the same domain.' ),
			};
		}
	}
	return valid;
}
