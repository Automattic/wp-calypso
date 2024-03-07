import { Dialog } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps } from 'react';
import { GitHubBrowseRepositories } from '../components/repositories/browse-repositories';

interface DeleteDeploymentDialogProps {
	isVisible: boolean;
	onChange: ComponentProps< typeof GitHubBrowseRepositories >[ 'onSelectRepository' ];
	onClose(): void;
}

export const RepositorySelectionDialog = ( {
	isVisible,
	onChange,
	onClose,
}: DeleteDeploymentDialogProps ) => {
	const { __ } = useI18n();

	return (
		<Dialog
			showCloseIcon
			isVisible={ isVisible }
			shouldCloseOnOverlayClick
			shouldCloseOnEsc
			onClose={ onClose }
		>
			<div css={ { width: '622px', height: '470px', display: 'flex', flexDirection: 'column' } }>
				<h1 css={ { marginBottom: '24px !important' } }>{ __( 'Select repository' ) }</h1>
				<GitHubBrowseRepositories onSelectRepository={ onChange } />
			</div>
		</Dialog>
	);
};
