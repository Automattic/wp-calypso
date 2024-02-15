import { useI18n } from '@wordpress/react-i18n';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import { CreateRepositoryForm } from './create-repository-form';
import {
	MutationVariables,
	useCreateCodeDeploymentAndRepository,
} from './use-create-code-deployment-and-repository';
import './style.scss';

export const CreateRepository = () => {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId );

	const { createDeploymentAndRepository } = useCreateCodeDeploymentAndRepository(
		siteId as number
	);

	function handleCreateRepository( args: MutationVariables ) {
		createDeploymentAndRepository( args );
	}

	return (
		<Main fullWidthLayout>
			<HeaderCake backHref="#">
				<h1>{ __( 'Create repository' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				<ActionPanelBody>
					<CreateRepositoryForm onRepositoryCreated={ handleCreateRepository } />
				</ActionPanelBody>
			</ActionPanel>
		</Main>
	);
};
