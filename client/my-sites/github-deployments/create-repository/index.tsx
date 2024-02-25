import page from '@automattic/calypso-router';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import HeaderCake from 'calypso/components/header-cake';
import { createDeploymentPage, indexPage } from 'calypso/my-sites/github-deployments/routes';
import { useDispatch, useSelector } from 'calypso/state/index';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';
import { PageShell } from '../components/page-shell';
import { useCreateCodeDeployment } from '../deployment-creation/use-create-code-deployment';
import { CreateRepositoryForm, OnRepositoryCreatedParams } from './create-repository-form';
import { useCreateRepository } from './use-create-repository';

import './style.scss';

const noticeOptions = {
	duration: 3000,
};

export const CreateRepository = () => {
	const { __ } = useI18n();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const goToDeployments = () => {
		page( indexPage( siteSlug! ) );
	};

	const dispatch = useDispatch();

	const { createRepository, isPending } = useCreateRepository( {
		onError: ( error ) => {
			dispatch(
				errorNotice(
					// translators: "reason" is why creating the repository failed.
					sprintf( __( 'Failed to create repository: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
					}
				)
			);
		},
	} );
	const { createDeployment, isPending: isDeploying } = useCreateCodeDeployment( siteId as number, {
		onSuccess: () => {
			goToDeployments();
			dispatch( successNotice( __( 'Repository connected' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				errorNotice(
					// translators: "reason" is why creating the repository failed.
					sprintf( __( 'Failed to connect repository: %(reason)s' ), {
						reason: error.message,
					} ),
					{
						...noticeOptions,
					}
				)
			);
		},
	} );

	const handleCreateRepository = ( args: OnRepositoryCreatedParams ) => {
		createRepository( args ).then( ( response ) => {
			createDeployment( {
				installationId: args.installationId,
				externalRepositoryId: response.external_id,
				branchName: response.default_branch,
				targetDir: args.targetDir,
				isAutomated: args.isAutomated,
				workflowPath: args.workflowPath,
			} );
		} );
	};

	return (
		<PageShell pageTitle={ __( 'Create repository' ) }>
			<HeaderCake onClick={ () => page( createDeploymentPage( siteSlug! ) ) } isCompact>
				<h1>{ __( 'Create repository' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				<ActionPanelBody css={ { overflow: 'visible !important' } }>
					<CreateRepositoryForm
						onRepositoryCreated={ handleCreateRepository }
						isPending={ isPending || isDeploying }
					/>
				</ActionPanelBody>
			</ActionPanel>
		</PageShell>
	);
};
