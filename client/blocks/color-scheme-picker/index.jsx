/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import QueryPreferences from 'components/data/query-preferences';
import { savePreference, setPreference } from 'state/preferences/actions';
import { getPreference } from 'state/preferences/selectors';
import { ColorSchemes } from './constants';
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
		const addSelection = handleFunction => handleFunction( event.currentTarget.value );
		temporarySelection && addSelection( onSelection );
		addSelection( saveColorSchemePreference );
	};

	render() {
		return (
			<div className="color-scheme-picker">
				<QueryPreferences />
				<FormRadiosBar
					isThumbnail={ true }
					checked={ this.props.colorSchemePreference }
					onChange={ this.handleColorSchemeSelection }
					items={ ColorSchemes }
				/>
			</div>
		);
	}
}

export default connect(
	state => {
		return {
			colorSchemePreference: getPreference( state, 'colorScheme' ),
		};
	},
	( dispatch, ownProps ) =>
		bindActionCreators(
			{
				saveColorSchemePreference: colorSchemePreference => {
					if ( ownProps.temporarySelection ) {
						return setPreference( 'colorScheme', colorSchemePreference );
					}
					return savePreference( 'colorScheme', colorSchemePreference );
				},
			},
			dispatch
		)
)( ColorSchemePicker );
