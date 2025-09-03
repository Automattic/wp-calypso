import { Button, Modal } from '@wordpress/components';

export const DomainSearchTrademarkClaimsModal = ( {
	isOpen,
	onAccept,
	onClose,
}: {
	isOpen: boolean;
	onAccept: () => void;
	onClose: () => void;
} ) => {
	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal title="This is my modal" onRequestClose={ onClose }>
			<Button variant="secondary" onClick={ onClose }>
				Reject
			</Button>
			<Button variant="primary" onClick={ onAccept }>
				Accept
			</Button>
		</Modal>
	);
};
