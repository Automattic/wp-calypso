/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { requestDeleteProduct } from 'calypso/state/memberships/product-list/actions';

const RecurringPaymentsPlanDeleteModal = ( { closeDialog, deleteProduct, product, siteId } ) => {
	const translate = useTranslate();

	const onClose = ( reason ) => {
		if ( reason === 'delete' ) {
			deleteProduct( siteId, product, translate( '"%s" was deleted.', { args: product.title } ) );
		}
		closeDialog();
	};

	return (
		<Dialog
			isVisible
			buttons={ [
				{
					label: translate( 'Cancel' ),
					action: 'cancel',
				},
				{
					label: translate( 'Delete' ),
					isPrimary: true,
					action: 'delete',
				},
			] }
			onClose={ onClose }
		>
			<h1>{ translate( 'Confirmation' ) }</h1>
			<p>
				{ translate( 'Do you want to delete "%s"?', {
					args: product?.title,
				} ) }
			</p>
			<Notice
				text={ translate(
					'Deleting a product does not cancel the subscription for existing subscribers.{{br/}}They will continue to be charged even after you delete it.',
					{ components: { br: <br /> } }
				) }
				showDismiss={ false }
			/>
		</Dialog>
	);
};

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
	} ),
	{ deleteProduct: requestDeleteProduct }
)( RecurringPaymentsPlanDeleteModal );
