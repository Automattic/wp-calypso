import { ToggleControl } from '@wordpress/components';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { toggleWPcomEmailSetting, saveSettings } from 'calypso/state/notification-settings/actions';
import {
	getNotificationSettings,
	isFetchingNotificationsSettings,
} from 'calypso/state/notification-settings/selectors';

class EmailCategory extends Component {
	static propTypes = {
		name: PropTypes.string,
		isEnabled: PropTypes.bool,
		title: PropTypes.string,
		description: PropTypes.string,
	};

	toggleSetting = ( toggleValue ) => {
		this.props.toggleWPcomEmailSetting( this.props.name );
		// settings is not updated immediately, so we need to save the settings manually
		this.props.saveSettings( 'wpcom', {
			...this.props.settings,
			[ this.props.name ]: toggleValue,
		} );
	};

	render() {
		const { isEnabled, description, title } = this.props;
		return (
			<ToggleControl
				__nextHasNoMarginBottom
				checked={ isEnabled }
				className="wpcom-settings__notification-settings-emailcategory"
				help={ description }
				label={ title }
				onChange={ this.toggleSetting }
				disabled={ this.props.isFetching }
			/>
		);
	}
}

export default connect(
	( state ) => ( {
		settings: getNotificationSettings( state, 'wpcom' ),
		isFetching: isFetchingNotificationsSettings( state ),
	} ),
	{ toggleWPcomEmailSetting, saveSettings }
)( EmailCategory );
