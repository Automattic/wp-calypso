/**
 * External dependencies
 */
import emailValidator from 'email-validator';
import { Fragment } from '@wordpress/element';

const renderEmail = inputText => {
	const explodedInput = inputText.split( /(\s+)/ ).map( ( email, i ) => {
		// Remove and punctuation from the end of the email address.
		const emailToValidate = email.replace( /([.,/#!$%^&*;:{}=\-_`~()\][])+$/g, '' );
		if ( email.indexOf( '@' ) && emailValidator.validate( emailToValidate ) ) {
			return email === emailToValidate ? (
				// Email.
				<a href={ `mailto:${ email }` } key={ i }>
					{ email }
				</a>
			) : (
				// Email with punctionation.
				<Fragment key={ i }>
					<a href={ `mailto:${ email }` } key={ i }>
						{ emailToValidate }
					</a>
					<Fragment>{ email.slice( -( email.length - emailToValidate.length ) ) }</Fragment>
				</Fragment>
			);
		}
		// Just a plain string.
		return <Fragment key={ i }>{ email }</Fragment>;
	} );
	return explodedInput;
};

const save = ( { attributes: { email }, className } ) =>
	email && <div className={ className }>{ renderEmail( email ) }</div>;

export default save;
