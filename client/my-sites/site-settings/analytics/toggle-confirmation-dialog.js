/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { Dialog, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

const AnalyticsToggleConfirmationDialog = ( {
	onClose,
	onConfirm,
	productToDisable,
	productToEnable,
} ) => {
	const translate = useTranslate();
	const getDialogButtons = () => {
		return [
			<Button key="activate" primary={ true } onClick={ onConfirm }>
				{ translate( `Activate %(productToEnable)s`, {
					args: {
						productToEnable,
					},
				} ) }
			</Button>,
			<Button key="close" primary={ false } onClick={ onClose }>
				{ translate( 'Cancel' ) }
			</Button>,
		];
	};

	return (
		<Dialog
			isVisible={ true }
			buttons={ getDialogButtons() }
			additionalClassNames="toggle-confirmation-dialog__confirmation-dialog is-narrow"
		>
			{ translate(
				`Activating %(productToEnable)s will deactivate %(productToDisable)s. Would you like to proceed?`,
				{
					args: {
						productToEnable,
						productToDisable,
					},
				}
			) }
		</Dialog>
	);
};

AnalyticsToggleConfirmationDialog.propTypes = {
	onClose: PropTypes.func,
	onConfirm: PropTypes.func,
	productToDisable: PropTypes.string,
	productToEnable: PropTypes.string,
};

AnalyticsToggleConfirmationDialog.defaultProps = {
	onClose: noop,
};

export default AnalyticsToggleConfirmationDialog;
