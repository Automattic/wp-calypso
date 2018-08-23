/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import { savePreference, setPreference } from 'state/preferences/actions';
import getColorSchemesData from './constants';
import FormRadiosBar from 'components/forms/form-radios-bar';

class ColorSchemePicker extends PureComponent {
	static propTypes = {
		temporarySelection: PropTypes.bool,
		onSelection: PropTypes.func,
		// Connected props
		colorSchemePreference: PropTypes.string,
		saveColorSchemePreference: PropTypes.func,
	};

	handleColorSchemeSelection = event => {
		const { temporarySelection, onSelection, saveColorSchemePreference } = this.props;
		const { value } = event.currentTarget;
		if ( temporarySelection ) {
			onSelection( value );
		}
		saveColorSchemePreference( value, temporarySelection );
	};

	render() {
		return (
			<div className="color-scheme-picker">
				<QueryPreferences />
				<FormRadiosBar
					isThumbnail
					checked={ this.props.colorSchemePreference }
					onChange={ this.handleColorSchemeSelection }
					items={ getColorSchemesData( translate ) }
				/>
			</div>
		);
	}
}

const saveColorSchemePreference = ( preference, temporarySelection ) =>
	temporarySelection
		? setPreference( 'colorScheme', preference )
		: savePreference( 'colorScheme', preference );

const ColorSchemePickerWithData = withSelect( select => {
	const { getPreference } = select( 'calypso' );
	return {
		colorSchemePreference: getPreference( 'colorScheme' ),
	};
} )( ColorSchemePicker );

// TODO: Remove this connect altogether after adding `withDispatch` for the actions.
export default connect(
	() => ( {} ),
	{ saveColorSchemePreference }
)( ColorSchemePickerWithData );
