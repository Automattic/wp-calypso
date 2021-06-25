/**
 * External dependencies
 */
import { useDispatch } from 'react-redux';
import React, {
	FunctionComponent,
	ChangeEventHandler,
	useCallback,
	useEffect,
	useState,
} from 'react';

/**
 * Internal dependencies
 */
import { savePreference } from 'calypso/state/preferences/actions';

interface Props {
	name: string;
	value: string;
}

const StringPreference: FunctionComponent< Props > = ( { name, value } ) => {
	const dispatch = useDispatch();

	const [ localValue, setLocalValue ] = useState( value );

	const savePreferenceChange = useCallback( () => {
		dispatch( savePreference( name, localValue ) );
	}, [ dispatch, localValue, name ] );

	const resetPreferenceChange = () => {
		setLocalValue( value );
	};

	const handleLocalChange: ChangeEventHandler< HTMLInputElement > = ( event ) => {
		setLocalValue( event.target.value );
	};

	useEffect( () => setLocalValue( value ), [ value ] );

	return (
		<div id={ name } className="string-preference">
			<input type="string" onChange={ handleLocalChange } value={ localValue } />
			{ value !== localValue && (
				<>
					<button
						className="preferences-helper__save-pref-button"
						onClick={ savePreferenceChange }
						disabled={ value === localValue }
					>
						{ 'save' }
					</button>{ ' ' }
					<button
						className="preferences-helper__reset-pref-button"
						onClick={ resetPreferenceChange }
						disabled={ value === localValue }
					>
						{ 'reset' }
					</button>
				</>
			) }
		</div>
	);
};

export default StringPreference;
