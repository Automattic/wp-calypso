/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'i18n-calypso';
import { compose } from '@wordpress/compose';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
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

export default compose( [
	withSelect( select => {
		const { getPreference } = select( 'calypso' );
		return {
			colorSchemePreference: getPreference( 'colorScheme' ),
		};
	} ),
	withDispatch( dispatch => {
		const { setPreference, savePreference } = dispatch( 'calypso' );

		return {
			saveColorSchemePreference( preference, temporarySelection ) {
				if ( temporarySelection ) {
					setPreference( 'colorScheme', preference );
				} else {
					savePreference( 'colorScheme', preference );
				}
			},
		};
	} ),
] )( ColorSchemePicker );
