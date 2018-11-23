/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Settings from './settings';
import Actions from './actions';

class NotificationSettingsForm extends Component {
	static propTypes = {
		sourceId: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ).isRequired,
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
		settings: PropTypes.object,
		isApplyAllVisible: PropTypes.bool,
		hasUnsavedChanges: PropTypes.bool.isRequired,
		onToggle: PropTypes.func.isRequired,
		onSave: PropTypes.func.isRequired,
		onSaveToAll: PropTypes.func,
	};

	render() {
		return (
			<div>
				<Settings
					blogId={ this.props.sourceId }
					settingKeys={ this.props.settingKeys }
					settings={ this.props.settings }
					onToggle={ this.props.onToggle }
				/>
				<Actions
					sourceId={ this.props.sourceId }
					settings={ this.props.settings }
					isApplyAllVisible={ this.props.isApplyAllVisible }
					disabled={ ! this.props.hasUnsavedChanges }
					onSave={ this.props.onSave }
					onSaveToAll={ this.props.onSaveToAll }
				/>
			</div>
		);
	}
}

export default NotificationSettingsForm;
