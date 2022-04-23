import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference, setPreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import getColorSchemesData from './constants';

import './style.scss';

function ColorSchemePicker( { defaultSelection, temporarySelection, onSelection, disabled } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const colorSchemePreference = useSelector( ( state ) => getPreference( state, 'colorScheme' ) );

	async function handleColorSchemeSelection( event ) {
		const { value } = event.currentTarget;

		if ( temporarySelection ) {
			dispatch( setPreference( 'colorScheme', value ) );
		} else {
			await dispatch( savePreference( 'colorScheme', value ) );
			dispatch(
				successNotice( translate( 'Settings saved successfully!' ), {
					id: 'color-scheme-picker-save',
					duration: 10000,
				} )
			);
		}
		onSelection?.( value );
	}

	const colorSchemesData = getColorSchemesData( translate );
	const defaultColorScheme = defaultSelection || colorSchemesData[ 0 ].value;
	const checkedColorScheme = colorSchemesData.some(
		( { value } ) => value === colorSchemePreference
	)
		? colorSchemePreference
		: defaultColorScheme;

	return (
		<div className="color-scheme-picker">
			<QueryPreferences />
			<FormRadiosBar
				isThumbnail
				checked={ checkedColorScheme }
				onChange={ handleColorSchemeSelection }
				items={ colorSchemesData }
				disabled={ disabled }
			/>
		</div>
	);
}

ColorSchemePicker.propTypes = {
	defaultSelection: PropTypes.string,
	temporarySelection: PropTypes.bool,
	onSelection: PropTypes.func,
	disabled: PropTypes.bool,
};

export default ColorSchemePicker;
