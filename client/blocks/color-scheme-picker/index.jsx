/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getColorSchemesData from './constants';
import QueryPreferences from 'components/data/query-preferences';
import FormRadiosBar from 'components/forms/form-radios-bar';
import { savePreference, setPreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';

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

export default connect(
	state => {
		return {
			colorSchemePreference: getPreference( state, 'colorScheme' ),
		};
	},
	{ saveColorSchemePreference }
)( ColorSchemePicker );
