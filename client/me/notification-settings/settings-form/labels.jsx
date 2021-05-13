/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import StreamHeader from './stream-header';
import LabelsList from './labels-list';

class NotificationSettingsFormLabels extends React.Component {
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
