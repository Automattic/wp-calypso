import { Dialog, ExternalLink } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { GitHubBrowseRepositories } from '../components/repositories/browse-repositories';

import './style.scss';

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
			<div className="repository-selection-dialog">
				<FormattedHeader
					align="left"
					headerText={ __( 'Select repository' ) }
					subHeaderText={ createInterpolateElement(
						__( 'Pick an existing repository or <docsLink>create a new one</docsLink>.' ),
						{
							docsLink: (
								<ExternalLink
									href="https://developer.wordpress.com/docs/developer-tools/github-deployments/create-github-deployment-source-files/"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						}
					) }
				/>
				<GitHubBrowseRepositories onSelectRepository={ onChange } />
			</div>
		</Dialog>
	);
};
