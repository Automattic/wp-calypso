import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { Spinner } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { DeploymentCommitDetails } from 'calypso/my-sites/github-deployments/deployments/deployment-commit-details';
import { DeploymentDuration } from 'calypso/my-sites/github-deployments/deployments/deployment-duration';
import {
	DeploymentStatus,
	DeploymentStatusValue,
} from 'calypso/my-sites/github-deployments/deployments/deployment-status';
import { useCreateCodeDeploymentRun } from 'calypso/my-sites/github-deployments/deployments/use-create-code-deployment-run';
import { formatDate } from 'calypso/my-sites/github-deployments/utils/dates';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useDispatch, useSelector } from '../../../state';
import { manageDeploymentPage, viewDeploymentLogs } from '../routes';
import { DeleteDeploymentDialog } from './delete-deployment-dialog';
import { DeploymentStarterMessage } from './deployment-starter-message';
import { DeploymentsListItemActions } from './deployments-list-item-actions';
import { CodeDeploymentData } from './use-code-deployments-query';

const noticeOptions = {
	duration: 3000,
};

interface DeploymentsListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsListItem = ( { deployment }: DeploymentsListItemProps ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const dispatch = useDispatch();
	const locale = useLocale();
	const { __ } = useI18n();

	const { triggerManualDeployment, isPending: isTriggeringDeployment } = useCreateCodeDeploymentRun(
		deployment.blog_id,
		deployment.id,
		{
			onSuccess: () => {
				dispatch( successNotice( __( 'Deployment run created.' ), noticeOptions ) );
			},
			onError: ( error ) => {
				if ( error.code === 'invalid_workflow_file' ) {
					dispatch(
						errorNotice(
							translate( 'The workflow file is invalid. {{a}}Take action{{/a}}', {
								components: {
									a: (
										<a
											href={ manageDeploymentPage( siteSlug as string, deployment.id ) }
											onClick={ () => {
												dispatch( removeNotice( 'github-invalid-workflow-file' ) );
											} }
										/>
									),
								},
							} ),
							{
								id: 'github-invalid-workflow-file',
								isPersistent: true,
							}
						)
					);
				} else {
					dispatch(
						errorNotice(
							// translators: "reason" is why connecting the branch failed.
							sprintf( __( 'Failed to trigger deployment run: %(reason)s' ), {
								reason: error.message,
							} ),
							{
								...noticeOptions,
							}
						)
					);
				}
			},
		}
	);

	const [ isDisconnectRepositoryDialogVisible, setDisconnectRepositoryDialogVisibility ] =
		useState( false );

	const run = deployment.current_deployment_run;
	const [ installation, repo ] = deployment.repository_name.split( '/' );

	const columns = run ? (
		<>
			<td>{ run && <DeploymentCommitDetails run={ run } deployment={ deployment } /> }</td>
			<td>
				{ run && (
					<DeploymentStatus
						status={ run.status as DeploymentStatusValue }
						href={ viewDeploymentLogs( siteSlug!, deployment.id ) }
					/>
				) }
			</td>
			<td>
				<span>{ formatDate( locale, new Date( run.created_on ) ) }</span>
			</td>
			<td>{ run && <DeploymentDuration run={ run } /> }</td>
		</>
	) : (
		<DeploymentStarterMessage deployment={ deployment } />
	);

	return (
		<>
			<tr>
				<td>
					<div className="github-deployments-list__repository-details">
						<Button
							onClick={ () => {
								page( manageDeploymentPage( siteSlug!, deployment.id ) );
							} }
						>
							{ repo }
						</Button>
						<span>{ installation }</span>
					</div>
				</td>
				{ columns }
				<td>
					{ isTriggeringDeployment ? (
						<Spinner />
					) : (
						<DeploymentsListItemActions
							siteSlug={ siteSlug! }
							deployment={ deployment }
							onManualDeployment={ triggerManualDeployment }
							onDisconnectRepository={ () => setDisconnectRepositoryDialogVisibility( true ) }
						/>
					) }
				</td>
			</tr>
			<DeleteDeploymentDialog
				deployment={ deployment }
				isVisible={ isDisconnectRepositoryDialogVisible }
				onClose={ () => setDisconnectRepositoryDialogVisibility( false ) }
			/>
		</>
	);
};
