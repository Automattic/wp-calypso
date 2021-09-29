import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import LabelsList from './labels-list';
import StreamHeader from './stream-header';

class NotificationSettingsFormLabels extends Component {
	static displayName = 'NotificationSettingsFormLabels';

	static propTypes = {
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
	};

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<div className="notification-settings-form-labels">
				<StreamHeader title={ this.props.translate( 'notifications' ) } />
				<LabelsList settingKeys={ this.props.settingKeys } />
			</div>
		);
	}
}

export default localize( NotificationSettingsFormLabels );
