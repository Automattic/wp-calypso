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
			let just_number = number.replace( /\D/g, '' );
			if ( number.startsWith( '+' ) ) {
				just_number = '+' + just_number;
			}

			return (
				<a href={ `tel:${ just_number }` } key={ i }>
					{ number }
				</a>
			);
		}
	);
}

const save = ( { attributes: { phone }, className } ) =>
	phone && <div className={ className }>{ renderPhone( phone ) }</div>;

export default save;
