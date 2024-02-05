import { Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { CreateRepositoryForm } from './create-repository-form';

type CreateRepositoryModalProps = {
	onClose: () => void;
	onRepositoryCreated?: () => void;
	className?: string;
};

export const CreateRepositoryModal = ( {
	onClose,
	className,
	onRepositoryCreated,
}: CreateRepositoryModalProps ) => {
	const { __ } = useI18n();
	return (
		<Modal
			className={ className }
			onRequestClose={ onClose }
			shouldCloseOnEsc={ false }
			size="medium"
			shouldCloseOnClickOutside={ false }
			title={ __( 'Create repository' ) }
		>
			<CreateRepositoryForm onRepositoryCreated={ onRepositoryCreated } onCancel={ onClose } />
		</Modal>
	);
};
