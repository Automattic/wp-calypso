import { HostingTrialAcknowledgement } from './hosting-acknowledge';
import { Modal } from '@wordpress/components';

type TrialAcknowledgeModalProps = {
	setOpenModal: ( open: boolean ) => void;
};

export const TrialAcknowledgeModal = ( { setOpenModal }: TrialAcknowledgeModalProps ) => {
	const dismissAndRecordEvent = ( dialogAction: string | undefined ) => {};

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
