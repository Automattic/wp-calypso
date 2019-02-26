/**
 * Internal dependencies
 */

export function renderPhone( inputText ) {
	const arrayOfNumbers = inputText.match( /\d+\.\d+|\d+\b|\d+(?=\w)/g );
	if ( ! arrayOfNumbers ) {
		// No numbers found
		return inputText;
	}
	const indexOfFirstNumber = inputText.indexOf( arrayOfNumbers[ 0 ] );

	// Assume that everthing after the first number should be a part of the phone number.
	// care about the first prefix character.
	let phoneNumber = indexOfFirstNumber ? inputText.substring( indexOfFirstNumber - 1 ) : inputText;
	let prefix = indexOfFirstNumber ? inputText.substring( 0, indexOfFirstNumber ) : '';

	let justNumber = phoneNumber.replace( /\D/g, '' );
	// Phone numbers starting with + shoud be part of the number.
	if ( /[0-9/+/(]/.test( phoneNumber.substring( 0, 1 ) ) ) {
		// Remove the special charater from the prefix so they don't appear twice.
		prefix = prefix.slice( 0, -1 );
		// Phone numbers starting with + shoud be part of the number.
		if ( phoneNumber.substring( 0, 1 ) === '+' ) {
			justNumber = '+' + justNumber;
		}
	} else {
		phoneNumber = phoneNumber.substring( 1 ); // Remove the first character.
	}
	const prefixSpan = prefix.trim() ? (
		<span key="phonePrefix" className="phone-prefix">
			{ prefix }
		</span>
	) : null;
	return [
		prefixSpan,
		<a key="phoneNumber" href={ `tel:${ justNumber }` }>
			{ phoneNumber }
		</a>,
	];
}

const save = ( { attributes: { phone }, className } ) =>
	phone && <div className={ className }>{ renderPhone( phone ) }</div>;

export default save;
