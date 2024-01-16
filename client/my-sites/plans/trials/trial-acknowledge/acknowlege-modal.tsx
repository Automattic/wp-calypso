import { Modal } from '@wordpress/components';
import { HostingTrialAcknowledgement } from './hosting-acknowledge';

type TrialAcknowledgeModalProps = {
	setOpenModal: ( open: boolean ) => void;
};

export const TrialAcknowledgeModal = ( { setOpenModal }: TrialAcknowledgeModalProps ) => {
	return (
		<Modal onRequestClose={ () => setOpenModal( false ) } shouldCloseOnClickOutside={ false }>
			<HostingTrialAcknowledgement
				showFeatureList={ false }
				onStartTrialClick={ function (): void {
					throw new Error( 'Function not implemented.' );
				} }
			/>
		</Modal>
	);
};
