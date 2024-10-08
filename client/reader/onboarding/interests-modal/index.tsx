import { Modal } from '@wordpress/components';
import React from 'react';

interface InterestsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const InterestsModal: React.FC< InterestsModalProps > = ( { isOpen, onClose } ) => {
	return (
		isOpen && (
			<Modal title="Select Your Interests" onRequestClose={ onClose } isFullScreen={ false }>
				<p>Interest content here.</p>
				<button onClick={ onClose }>Close</button>
			</Modal>
		)
	);
};

export default InterestsModal;
