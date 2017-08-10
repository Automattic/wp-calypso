/** @format */
/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { getLabelForSetting } from './locales';

export default React.createClass( {
	displayName: 'NotificationSettingsFormLabelList',

	propTypes: {
		settingKeys: PropTypes.arrayOf( PropTypes.string ).isRequired,
	},

	shouldComponentUpdate() {
		return false;
	},

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
	},
} );
