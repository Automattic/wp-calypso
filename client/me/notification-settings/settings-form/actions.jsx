import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormButton from 'calypso/components/forms/form-button';

import './actions.scss';

class NotificationSettingsFormActions extends PureComponent {
	static propTypes = {
		onSave: PropTypes.func.isRequired,
		onSaveToAll: PropTypes.func,
		disabled: PropTypes.bool.isRequired,
		isApplyAllVisible: PropTypes.bool,
	};

	render() {
		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<div className="notification-settings-form-actions">
				<FormButton disabled={ this.props.disabled } onClick={ this.props.onSave }>
					{ this.props.translate( 'Save settings' ) }
				</FormButton>

				{ this.props.isApplyAllVisible && (
					<FormButton
						className="notification-settings-form-actions__save-to-all"
						disabled={ this.props.disabled }
						onClick={ this.props.onSaveToAll }
						isPrimary={ false }
					>
						{ this.props.translate( 'Save to all sites' ) }
					</FormButton>
				) }
			</div>
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		);
	}
}

export default localize( NotificationSettingsFormActions );
