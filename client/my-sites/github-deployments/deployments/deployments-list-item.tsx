import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { DropdownMenu, MenuGroup, MenuItem, Spinner } from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { Icon, linkOff } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { DeploymentCommitDetails } from 'calypso/my-sites/github-deployments/deployments/deployment-commit-details';
import { DeploymentDuration } from 'calypso/my-sites/github-deployments/deployments/deployment-duration';
import {
	DeploymentStatus,
	DeploymentStatusValue,
} from 'calypso/my-sites/github-deployments/deployments/deployment-status';
import { useCreateCodeDeploymentRun } from 'calypso/my-sites/github-deployments/deployments/use-create-code-deployment-run';
import { formatDate } from 'calypso/my-sites/github-deployments/utils/dates';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useDispatch, useSelector } from '../../../state';
import { manageDeploymentPage, viewDeploymentLogs } from '../routes';
import { DeleteDeploymentDialog } from './delete-deployment-dialog';
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
			},
			onSettled: ( _, error ) => {
				dispatch(
					recordTracksEvent( 'calypso_hosting_github_manual_deployment_run_success', {
						connected: ! error,
					} )
				);
			},
		}
	);

	const [ isDisconnectRepositoryDialogVisible, setDisconnectRepositoryDialogVisibility ] =
		useState( false );

	const run = deployment.current_deployment_run;
	const [ installation, repo ] = deployment.repository_name.split( '/' );

	const getStarterMessage = () => {
		if ( deployment.is_automated ) {
			// Translators: %(branch)s is the branch name of the repository, %(repo)s is the repository name
			return sprintf( __( 'Push something to the ‘%(branch)s’ branch of ‘%(repo)s’' ), {
				branch: deployment.branch_name,
				repo: deployment.repository_name,
			} );
		}

		return __( 'Whenever you are ready, trigger a deployment from the ellipsis menu' );
	};

	const columns = run ? (
		<>
			<td>{ run && <DeploymentCommitDetails run={ run } deployment={ deployment } /> }</td>
			<td>{ run && <DeploymentStatus status={ run.status as DeploymentStatusValue } /> }</td>
			<td>
				<span>{ formatDate( locale, new Date( run.created_on * 1000 ) ) }</span>
			</td>
			<td>{ run && <DeploymentDuration run={ run } /> }</td>
		</>
	) : (
		<td colSpan={ 4 }>
			<i css={ { color: 'var(--Gray-Gray-40, #50575E)' } }>{ getStarterMessage() }</i>
		</td>
	);

	return (
		<>
			<tr>
				<td>
					<div className="github-deployments-list__repository-details">
						{ repo }
						<span>{ installation }</span>
					</div>
				</td>
				{ columns }
				<td>
					{ isTriggeringDeployment ? (
						<Spinner />
					) : (
						<DropdownMenu icon={ <Gridicon icon="ellipsis" /> } label="Select a direction">
							{ ( { onClose } ) => (
								<Fragment>
									<MenuGroup>
										<MenuItem
											onClick={ () => {
												triggerManualDeployment();
												onClose();
											} }
										>
											{ __( 'Trigger manual deploy' ) }
										</MenuItem>
										{ run && (
											<MenuItem
												onClick={ () => {
													page( viewDeploymentLogs( siteSlug!, deployment.id ) );
													onClose();
												} }
											>
												{ __( 'See deployment runs' ) }
											</MenuItem>
										) }
										<MenuItem
											onClick={ () => {
												page( manageDeploymentPage( siteSlug!, deployment.id ) );
												onClose();
											} }
										>
											{ __( 'Configure repository' ) }
										</MenuItem>
									</MenuGroup>
									<MenuGroup>
										<MenuItem
											className="github-deployments-list__menu-item-danger"
											onClick={ () => {
												setDisconnectRepositoryDialogVisibility( true );
												onClose();
											} }
										>
											<Icon icon={ linkOff } />
											{ __( 'Disconnect repository' ) }
										</MenuItem>
									</MenuGroup>
								</Fragment>
							) }
						</DropdownMenu>
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
