import { Modal } from '@wordpress/components';
import { HostingTrialAcknowledgement } from './hosting-acknowledge';

type TrialAcknowledgeModalProps = {
	setOpenModal: ( open: boolean ) => void;
	onStartTrialClick(): void;
};

export const TrialAcknowledgeModal = ( {
	setOpenModal,
	onStartTrialClick,
}: TrialAcknowledgeModalProps ) => {
	return (
		<Modal onRequestClose={ () => setOpenModal( false ) } shouldCloseOnClickOutside={ false }>
			<HostingTrialAcknowledgement
				showFeatureList={ false }
				onStartTrialClick={ onStartTrialClick }
			/>
		</Modal>
	);
};
