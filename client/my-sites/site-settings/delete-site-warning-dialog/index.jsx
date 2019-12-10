/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import Button from '@automattic/components/button';
import { purchasesRoot } from 'me/purchases/paths';

/**
 * Style dependencies
 */
import './style.scss';

function DeleteSiteWarningDialog( { isVisible, onClose } ) {
	const translate = useTranslate();
	const buttons = [
		{ action: 'dismiss', label: translate( 'Dismiss' ) },
		<Button primary href={ purchasesRoot }>
			{ translate( 'Manage Purchases', { context: 'button label' } ) }
		</Button>,
	];

	return (
		<Dialog
			isVisible={ isVisible }
			buttons={ buttons }
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
}

DeleteSiteWarningDialog.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
};

export default DeleteSiteWarningDialog;
