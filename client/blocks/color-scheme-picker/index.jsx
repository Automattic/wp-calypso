import { translate, localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import QueryPreferences from 'calypso/components/data/query-preferences';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import { successNotice } from 'calypso/state/notices/actions';
import { savePreference, setPreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import getColorSchemesData from './constants';

import './style.scss';

class ColorSchemePicker extends PureComponent {
	static propTypes = {
		defaultSelection: PropTypes.string,
		temporarySelection: PropTypes.bool,
		onSelection: PropTypes.func,
		disabled: PropTypes.bool,
		// Connected props
		colorSchemePreference: PropTypes.string,
		saveColorSchemePreference: PropTypes.func,
	};

	handleColorSchemeSelection = ( event ) => {
		const {
			temporarySelection,
			translate,
			onSelection,
			saveColorSchemePreference,
			successNotice,
		} = this.props;
		const { value } = event.currentTarget;
		const noticeSettings = {
			id: 'color-scheme-picker-save',
			duration: 10000,
		};

		if ( temporarySelection ) {
			onSelection( value );
		}
		saveColorSchemePreference( value, temporarySelection );

		successNotice( translate( 'Settings saved successfully!' ), noticeSettings );
	};

	render() {
		const colorSchemesData = getColorSchemesData( translate );
		const defaultColorScheme = this.props.defaultSelection || colorSchemesData[ 0 ].value;
		const checkedColorScheme = find( colorSchemesData, [
			'value',
			this.props.colorSchemePreference,
		] )
			? this.props.colorSchemePreference
			: defaultColorScheme;
		return (
			<div className="color-scheme-picker">
				<QueryPreferences />
				<FormRadiosBar
					isThumbnail
					checked={ checkedColorScheme }
					onChange={ this.handleColorSchemeSelection }
					items={ colorSchemesData }
					disabled={ this.props.disabled }
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
	( state ) => {
		return {
			colorSchemePreference: getPreference( state, 'colorScheme' ),
		};
	},
	{ saveColorSchemePreference, successNotice }
)( localize( ColorSchemePicker ) );
