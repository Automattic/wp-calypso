/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';

class NotificationSettingsFormActions extends React.PureComponent {
	static displayName = 'NotificationSettingsFormActions';

	static propTypes = {
		onSave: PropTypes.func.isRequired,
		onSaveToAll: PropTypes.func,
		disabled: PropTypes.bool.isRequired,
		isApplyAllVisible: PropTypes.bool,
	};

	render() {
		return (
			<div className="notification-settings-form-actions">
				{ this.props.isApplyAllVisible && (
					<FormButton
						className="notification-settings-form-actions__save-to-all"
						disabled={ this.props.disabled }
						onClick={ this.props.onSaveToAll }
						isPrimary={ false }
					>
						{ this.props.translate( 'Save to All Sites' ) }
					</FormButton>
				) }
				<FormButton disabled={ this.props.disabled } onClick={ this.props.onSave }>
					{ this.props.translate( 'Save Settings' ) }
				</FormButton>
			</div>
		);
	}
}

export default localize( NotificationSettingsFormActions );
