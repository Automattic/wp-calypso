import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { saveSettings, toggle } from 'calypso/state/notification-settings/actions';
import {
	getNotificationSettings,
	isFetchingNotificationsSettings,
} from 'calypso/state/notification-settings/selectors';

import './style.scss';

const ON_THIS_DAY_SETTING = 'on_this_day';

class OnThisDayNotificationSettings extends Component {
	static propTypes = {
		isFetching: PropTypes.bool,
		saveSettings: PropTypes.func.isRequired,
		settings: PropTypes.object,
		toggle: PropTypes.func.isRequired,
	};

	toggleSetting = ( toggleValue ) => {
		if ( ! this.props.settings ) {
			return;
		}

		this.props.toggle( 'other', 'timeline', ON_THIS_DAY_SETTING );
		this.props.saveSettings( 'other', {
			...this.props.settings,
			timeline: {
				...this.props.settings.timeline,
				[ ON_THIS_DAY_SETTING ]: toggleValue,
			},
		} );
	};

	render() {
		const { isFetching, settings, translate } = this.props;

		return (
			<Card
				id="on-this-day"
				className="notification-settings-on-this-day-notification-settings__settings"
			>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ !! settings?.timeline?.[ ON_THIS_DAY_SETTING ] }
					disabled={ isFetching || ! settings }
					help={ translate( 'Reminders about your posts from past years' ) }
					label={ translate( 'On this day' ) }
					onChange={ this.toggleSetting }
				/>
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		isFetching: isFetchingNotificationsSettings( state ),
		settings: getNotificationSettings( state, 'other' ),
	} ),
	{ saveSettings, toggle }
)( localize( OnThisDayNotificationSettings ) );
