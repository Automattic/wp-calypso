import { useTranslate } from 'i18n-calypso';
import { isPlainObject } from 'lodash';
import { useDispatch } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import ArrayPreference from './array-preference';
import BooleanPreference from './boolean-preference';
import NumberPreference from './number-preference';
import ObjectPreference from './object-preference';
import StringPreference from './string-preference';

export default function Preference( { name, value } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	let preferenceHandler = (
		<ul>
			<li key={ name }>{ value.toString() } </li>
		</ul>
	);

	if ( Array.isArray( value ) ) {
		preferenceHandler = <ArrayPreference name={ name } value={ value } />;
	} else if ( isPlainObject( value ) ) {
		preferenceHandler = <ObjectPreference name={ name } value={ value } />;
	} else if ( 'string' === typeof value ) {
		preferenceHandler = <StringPreference name={ name } value={ value } />;
	} else if ( 'boolean' === typeof value ) {
		preferenceHandler = <BooleanPreference name={ name } value={ value } />;
	} else if ( 'number' === typeof value ) {
		preferenceHandler = <NumberPreference name={ name } value={ value } />;
	}

	return (
		<div>
			<div className="preferences-helper__preference-header">
				<button
					className="preferences-helper__unset"
					onClick={ () => dispatch( savePreference( name, null ) ) }
					title={ translate( 'Unset Preference' ) }
				>
					{ 'X' }
				</button>
				<span>{ name }</span>
			</div>
			{ preferenceHandler }
		</div>
	);
}
