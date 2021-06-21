/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
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
	value: boolean;
}

const BooleanPreference: FunctionComponent< Props > = ( { name, value } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ localValue, setLocalValue ] = useState( value );

	const savePreferenceChange = useCallback( () => {
		dispatch( savePreference( name, localValue ) );
	}, [ dispatch, localValue, name ] );

	const resetPreferenceChange = () => {
		setLocalValue( value );
	};

	const handleLocalChange: ChangeEventHandler< HTMLInputElement > = ( event ) => {
		setLocalValue( event.target.checked );
	};

	useEffect( () => setLocalValue( value ), [ value ] );

	return (
		<div className="boolean-preference">
			<input type="checkbox" onChange={ handleLocalChange } checked={ localValue } />{ ' ' }
			{ value !== localValue && (
				<>
					<button
						className="preferences-helper__preference-save"
						onClick={ savePreferenceChange }
						disabled={ value === localValue }
					>
						{ translate( 'save' ) }
					</button>
					<button
						className="preferences-helper__preference-reset"
						onClick={ resetPreferenceChange }
						disabled={ value === localValue }
					>
						{ translate( 'reset' ) }
					</button>
				</>
			) }
		</div>
	);
};

export default BooleanPreference;
