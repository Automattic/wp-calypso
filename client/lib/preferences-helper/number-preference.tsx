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
	value: number;
}

const NumberPreference: FunctionComponent< Props > = ( { name, value } ) => {
	const dispatch = useDispatch();

	const [ localValue, setLocalValue ] = useState( value );

	const savePreferenceChange = useCallback( () => {
		dispatch( savePreference( name, localValue ) );
	}, [ dispatch, localValue, name ] );

	const resetPreferenceChange = () => {
		setLocalValue( value );
	};

	const handleLocalChange: ChangeEventHandler< HTMLInputElement > = ( event ) => {
		setLocalValue( parseInt( event.target.value ) );
	};

	useEffect( () => setLocalValue( value ), [ value ] );

	return (
		<div id={ name } className="number-preference">
			<input type="number" onChange={ handleLocalChange } value={ localValue } />
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

export default NumberPreference;
