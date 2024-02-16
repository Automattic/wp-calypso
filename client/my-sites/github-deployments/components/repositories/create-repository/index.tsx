import page from '@automattic/calypso-router';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { createPage, indexPage } from 'calypso/my-sites/github-deployments/routes';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useDispatch, useSelector } from 'calypso/state/index';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';
import { CreateRepositoryForm } from './create-repository-form';
import {
	MutationVariables,
	useCreateCodeDeploymentAndRepository,
} from './use-create-code-deployment-and-repository';

import './style.scss';

const noticeOptions = {
	duration: 3000,
};

export const CreateRepository = () => {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const createPath = createPage( siteSlug! );
	const goToDeployments = () => {
		page( indexPage( siteSlug! ) );
	};

	const dispatch = useDispatch();

	const { createDeploymentAndRepository, isPending } = useCreateCodeDeploymentAndRepository(
		siteId as number,
		{
			onSuccess: () => {
				goToDeployments();
				dispatch( successNotice( __( 'Deployment created.' ), noticeOptions ) );
			},
			onError: ( error ) => {
				dispatch(
					errorNotice(
						// translators: "reason" is why connecting the branch failed.
						sprintf( __( 'Failed to create repository: %(reason)s' ), { reason: error.message } ),
						{
							...noticeOptions,
						}
					)
				);
			},
			onSettled: ( _, error ) => {
				dispatch(
					recordTracksEvent( 'calypso_hosting_github_create_repository_success', {
						connected: ! error,
					} )
				);
			},
		}
	);

	function handleCreateRepository( args: MutationVariables ) {
		createDeploymentAndRepository( args );
	}

	return (
		<Main fullWidthLayout>
			<HeaderCake backHref={ createPath }>
				<h1>{ __( 'Create repository' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				<ActionPanelBody>
					<CreateRepositoryForm
						onRepositoryCreated={ handleCreateRepository }
						isPending={ isPending }
					/>
				</ActionPanelBody>
			</ActionPanel>
		</Main>
	);
};
