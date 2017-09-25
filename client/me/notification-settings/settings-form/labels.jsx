/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import LabelsList from './labels-list';
import StreamHeader from './stream-header';

export default localize( React.createClass( {
	displayName: 'NotificationSettingsFormLabels',

	propTypes: {
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired
	},

	shouldComponentUpdate() {
		return false;
	},

	render() {
		return (
		    <div className="notification-settings-form-labels">
				<StreamHeader title={ this.props.translate( 'notifications' ) } />
				<LabelsList settingKeys={ this.props.settingKeys } />
			</div>
		);
	}
} ) );
