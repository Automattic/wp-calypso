/**
 * Internal dependencies
 */
import textMatchReplace from 'gutenberg/extensions/presets/jetpack/utils/text-match-replace';

export function renderPhone( inputText ) {
	return textMatchReplace(
		inputText,
		/([0-9\()+]{1}[\ \-().]?[0-9]{1,6}[\ \-().]?[0-9]{0,6}[\ \-()]?[0-9]{0,6}[\ \-().]?[0-9]{0,6}[\ \-().]?[0-9]{0,6}[\ \-().]?[0-9]{0,6})/g,
		( number, i ) => {
			if ( number.trim() === '' ) {
				return number;
			}
			let justNumber = number.replace( /\D/g, '' );
			// Phone numbers starting with + shoud be part of the number.
			if ( number.substring( 0, 1 ) === '+' ) {
				justNumber = '+' + justNumber;
			}

			return (
				<a href={ `tel:${ justNumber }` } key={ i }>
					{ number }
				</a>
			);
		}
	);
}

const save = ( { attributes: { phone }, className } ) =>
	phone && <div className={ className }>{ renderPhone( phone ) }</div>;

export default save;
