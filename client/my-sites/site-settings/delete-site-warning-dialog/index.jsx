/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import { purchasesRoot } from 'me/purchases/paths';

/**
 * Style dependencies
 */
import './style.scss';

const DeleteSiteWarningDialog = ( { isVisible, onClose } ) => (
	<Dialog
		isVisible={ isVisible }
		buttons={ [
			{ action: 'dismiss', label: translate( 'Dismiss' ) },
			<a
				className="button is-primary" // eslint-disable-line wpcalypso/jsx-classname-namespace
				href={ purchasesRoot }
			>
				{ translate( 'Manage Purchases', { context: 'button label' } ) }
			</a>,
		] }
		onClose={ onClose }
		className="delete-site-warning-dialog"
	>
		<h1>{ translate( 'Premium Upgrades' ) }</h1>
		<p>
			{ translate(
				'You have active premium upgrades on your site. ' +
					'Please cancel your upgrades prior to deleting your site.'
			) }
		</p>
	</Dialog>
);

DeleteSiteWarningDialog.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};

export default DeleteSiteWarningDialog;
