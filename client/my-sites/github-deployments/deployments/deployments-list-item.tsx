import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { DropdownMenu, ExternalLink, MenuGroup, MenuItem } from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';
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
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useSelector } from '../../../state';
import { manageDeploymentPage, viewDeploymentLogs } from '../routes';
import { DeleteDeploymentDialog } from './delete-deployment-dialog';
import { CodeDeploymentData } from './use-code-deployments-query';

interface DeploymentsListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsListItem = ( { deployment }: DeploymentsListItemProps ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const locale = useLocale();
	const { __ } = useI18n();

	const { triggerManualDeployment } = useCreateCodeDeploymentRun(
		deployment.blog_id,
		deployment.id
	);

	const [ isDisconnectRepositoryDialogVisible, setDisconnectRepositoryDialogVisibility ] =
		useState( false );

	const run = deployment.current_deployed_run;
	const [ installation, repo ] = deployment.repository_name.split( '/' );

	return (
		<>
			<tr>
				<td>
					<div className="github-deployments-list__repository-details">
						{ repo }
						<span>{ installation }</span>
					</div>
				</td>
				<td>{ run && <DeploymentCommitDetails run={ run } deployment={ deployment } /> }</td>
				<td>{ run && <DeploymentStatus status={ run.status as DeploymentStatusValue } /> }</td>
				<td>
					<span>{ formatDate( locale, new Date( deployment.updated_on ) ) }</span>
				</td>
				<td>{ run && <DeploymentDuration run={ run } /> }</td>
				<td>
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
									<MenuItem
										onClick={ () => {
											page( viewDeploymentLogs( siteSlug!, deployment.id ) );
											onClose();
										} }
									>
										{ __( 'Open deployment list' ) }
									</MenuItem>
									<MenuItem onClick={ onClose }>
										<ExternalLink
											href={ `https://github.com/${ deployment.repository_name }/commits/${ deployment.branch_name }` }
										>
											{ __( 'Read logs on GitHub' ) }
										</ExternalLink>
									</MenuItem>
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
