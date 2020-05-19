/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import emailValidator from 'email-validator';
import { map, matches, reject, some, omit, pick, every, has } from 'lodash';

export const checkEmail = ( email ) => {
	return emailValidator.validate( email );
};

const verifySegment = ( segment ) => {
	const segmentItems = segment.match( /\S+/g ) || [];

	if ( segmentItems.length === 0 ) {
		return {
			error: true,
			msg: translate( 'Empty values between commas' ),
		};
	}

	//Items not comma separated
	if ( segmentItems.length !== 1 ) {
		return {
			error: true,
			msg: translate( '%(segment)s need to be comma separated.', {
				args: { segment },
			} ),
		};
	}

	//Check if email is valid, we use segmentItems[0] because it is already nicely trimmed
	const emailValid = checkEmail( segmentItems[ 0 ] );
	if ( ! emailValid ) {
		return {
			error: true,
			msg: translate( '%(segment)s is not a valid email address.', {
				args: { segment },
			} ),
		};
	}

	//All good
	return { error: false };
};

export const checkEmails = ( value ) => {
	//Empty value = no error
	if ( value === '' ) {
		return { error: false };
	}

	//All comma separated segments.
	const segments = value.trim().split( ',' );

	//Remove last segment if it caused by trailing comma
	const last = segments[ segments.length - 1 ];
	if ( last === '' ) {
		segments.splice( segments.length - 1, 1 );
	}

	const checkedValues = map( segments, verifySegment );
	const hasErrors = some( checkedValues, matches( { error: true } ) );
	if ( hasErrors ) {
		return {
			error: true,
			messages: reject( checkedValues, matches( { error: false } ) ),
		};
	}

	//All good
	return { error: false };
};

export const validateSettings = ( settings ) => {
	let areSettingsValid = false;
	const email = pick( settings, 'email' );
	areSettingsValid = checkEmail(
		email.email.woocommerce_email_from_address.value ||
			email.email.woocommerce_email_from_address.default
	);

	if ( ! areSettingsValid ) {
		return false;
	}

	const settingsNoEmail = omit( settings, 'email' );

	areSettingsValid = every( settingsNoEmail, ( setting ) => {
		if ( has( setting, 'recipient' ) ) {
			const value = setting.recipient.value;
			const def = setting.recipient.default;
			const check = checkEmails( value || def );
			return check.error === false;
		}
		return true;
	} );

	if ( ! areSettingsValid ) {
		return false;
	}

	return true;
};
