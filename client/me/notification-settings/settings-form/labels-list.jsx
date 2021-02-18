/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { getLabelForSetting } from './locales';

export default class extends React.Component {
	static displayName = 'NotificationSettingsFormLabelList';

	static propTypes = {
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
	};

	shouldComponentUpdate() {
		return false;
	}

	render() {
		return (
			<ul className="notification-settings-form-label-list">
				{ this.props.settingKeys.map( ( key, index ) => {
					return (
						<li key={ index } className="notification-settings-form-label-list__item">
							{ getLabelForSetting( key ) }
						</li>
					);
				} ) }
			</ul>
		);
	}
}
