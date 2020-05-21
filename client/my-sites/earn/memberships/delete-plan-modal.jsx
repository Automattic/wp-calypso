/**
 * External dependencies
 */

import React from 'react';
import { useTranslate } from 'i18n-calypso';
import Notice from 'components/notice';
/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';

const RecurringPaymentsPlanDeleteModal = ( { isVisible, planName, onClose } ) => {
	const translate = useTranslate();

	return (
		<Dialog
			isVisible={ isVisible }
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
					args: planName,
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

export default RecurringPaymentsPlanDeleteModal;
