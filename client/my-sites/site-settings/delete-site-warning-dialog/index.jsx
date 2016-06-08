/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import purchasesPaths from 'me/purchases/paths';

const DeleteSiteWarningDialog = ( { isVisible, onClose } ) => (
	<Dialog
		isVisible={ isVisible }
		buttons={ [
			{ action: 'dismiss', label: i18n.translate( 'Dismiss' ) },
			<a className="button is-primary" href={ purchasesPaths.list() }>{
				i18n.translate( 'Manage Purchases', { context: 'button label' } )
			}</a>
		] }
		onClose={ onClose }
		className="delete-site-warning-dialog">
		<h1>{ i18n.translate( 'Premium Upgrades' ) }</h1>
		<p>
			{
				i18n.translate(
					'You have active premium upgrades on your site. ' +
					'Please cancel your upgrades prior to deleting your site.'
				)
			}
		</p>
	</Dialog>
);

DeleteSiteWarningDialog.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired
};

export default DeleteSiteWarningDialog;
