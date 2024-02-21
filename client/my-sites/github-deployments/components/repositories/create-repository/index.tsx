import page from '@automattic/calypso-router';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import HeaderCake from 'calypso/components/header-cake';
import { indexPage } from 'calypso/my-sites/github-deployments/routes';
import { useDispatch, useSelector } from 'calypso/state/index';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';
import { useCreateCodeDeployment } from '../../../deployment-creation/use-create-code-deployment';
import { PageShell } from '../../page-shell/page-shell';
import { CreateRepositoryForm, OnRepositoryCreatedParams } from './create-repository-form';
import {
	useCreateRepository,
	MutationResponse as CreateRepositoryMutationResponse,
} from './use-create-repository';

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

	const canUserCreateDeployment = useSelector( ( state ) =>
		canCurrentUser( state, siteId, 'manage_options' )
	);

	const dispatch = useDispatch();

	const { createRepository, isPending } = useCreateRepository( siteId as number );
	const { createDeployment } = useCreateCodeDeployment( siteId as number );

	async function handleCreateRepository( args: OnRepositoryCreatedParams ) {
		let repository: CreateRepositoryMutationResponse | null = null;

		try {
			repository = await createRepository( args );
			dispatch( successNotice( __( 'Repository created.' ), noticeOptions ) );
		} catch ( error ) {
			if ( error instanceof Error ) {
				dispatch(
					errorNotice(
						// translators: "reason" is why creating the repository failed.
						sprintf( __( 'Failed to create repository: %(reason)s' ), { reason: error.message } ),
						{
							...noticeOptions,
						}
					)
				);
			}

			return;
		}

		if ( ! canUserCreateDeployment ) {
			dispatch(
				errorNotice(
					__( 'You do not have permissions to connect the created repository to the site.' ),
					{
						isPersistent: true,
					}
				)
			);

			goToDeployments();

			return;
		}

		try {
			await createDeployment( {
				installationId: args.installationId,
				externalRepositoryId: repository.external_id,
				branchName: repository.default_branch,
				targetDir: args.targetDir,
				isAutomated: args.isAutomated,
			} );

			dispatch( successNotice( __( 'Repository connected.' ), noticeOptions ) );
		} catch ( error ) {
			if ( error instanceof Error ) {
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
			}
		} finally {
			goToDeployments();
		}
	}

	return (
		<PageShell pageTitle={ __( 'Create repository' ) }>
			<HeaderCake onClick={ () => history.back() } isCompact>
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
		</PageShell>
	);
};
