import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ContentInfo from './content-info';
import type { ComponentProps } from 'react';

export default function SiteLeaveModal( {
	site,
	hasPurchasesCancelable,
	onClose,
}: ComponentProps< typeof ContentInfo > ) {
	return (
		<Modal title={ __( 'Leave site' ) } size="medium" onRequestClose={ onClose }>
			<ContentInfo
				site={ site }
				hasPurchasesCancelable={ hasPurchasesCancelable }
				onClose={ onClose }
			/>
		</Modal>
	);
}
