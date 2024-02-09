import { useI18n } from '@wordpress/react-i18n';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { CreateRepositoryForm } from './create-repository-form';
import './style.scss';
export const CreateRepository = () => {
	const { __ } = useI18n();

	return (
		<Main fullWidthLayout className="github-deployments-create-repository">
			<HeaderCake backHref="#">
				<h1>{ __( 'Create repository' ) }</h1>
			</HeaderCake>
			<ActionPanel style={ { margin: 0 } }>
				<ActionPanelBody>
					<CreateRepositoryForm onRepositoryCreated={ () => {} } />
				</ActionPanelBody>
			</ActionPanel>
		</Main>
	);
};
