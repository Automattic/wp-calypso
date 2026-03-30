import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Notice } from '../notice';

interface PendingPrimaryDomainNoticeProps {
	domainName: string;
	onClose?: () => void;
}

export default function PendingPrimaryDomainNotice( {
	domainName,
	onClose,
}: PendingPrimaryDomainNoticeProps ) {
	return (
		<Notice variant="info" title={ __( 'Setting up your custom domain' ) } onClose={ onClose }>
			{ createInterpolateElement(
				__(
					'We\u2019re preparing <domain /> to be your store\u2019s <strong>primary address</strong>. This usually takes a few moments, but can sometimes take up to 15 minutes.'
				),
				{
					domain: <strong>{ domainName }</strong>,
					strong: <strong />,
				}
			) }
		</Notice>
	);
}
