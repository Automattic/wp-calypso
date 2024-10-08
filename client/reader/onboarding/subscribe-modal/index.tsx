import { Modal } from '@wordpress/components';
import React from 'react';

interface SubscribeModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const SubscribeModal: React.FC< SubscribeModalProps > = ( { isOpen, onClose } ) => {
	return (
		isOpen && (
			<Modal title="Discover and Subscribe" onRequestClose={ onClose } isFullScreen>
				<p>Subscription content here.</p>
				<button onClick={ onClose }>Close</button>
			</Modal>
		)
	);
};

export default SubscribeModal;
