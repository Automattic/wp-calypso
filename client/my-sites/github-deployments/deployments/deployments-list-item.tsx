import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { DropdownMenu, ExternalLink, MenuGroup, MenuItem, Spinner } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, linkOff } from '@wordpress/icons';
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
import { CodeDeploymentData } from './use-code-deployments-query';
import { useDeleteCodeDeployment } from './use-delete-code-deployment';

interface DeploymentsListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsListItem = ( { deployment }: DeploymentsListItemProps ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const locale = useLocale();

	const { deleteDeployment, isPending } = useDeleteCodeDeployment(
		deployment.blog_id,
		deployment.id
	);

	const { triggerManualDeployment } = useCreateCodeDeploymentRun(
		deployment.blog_id,
		deployment.id
	);

	const run = deployment.current_deployed_run;
	const [ installation, repo ] = deployment.repository_name.split( '/' );

	return (
		<tr>
			<td>
				<div className="github-deployments-list__repository-details">
					{ repo }
					<span>{ installation }</span>
				</div>
			</td>
			<td>{ run && <DeploymentCommitDetails run={ run } deployment={ deployment } /> }</td>
			<td>
				{ run?.status && <DeploymentStatus status={ run.status as DeploymentStatusValue } /> }
			</td>
			<td>
				<span>{ formatDate( locale, new Date( deployment.updated_on ) ) }</span>
			</td>
			<td>{ run && <DeploymentDuration run={ run } /> }</td>
			<td>
				{ isPending ? (
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
											deleteDeployment();
											onClose();
										} }
									>
										<Icon icon={ linkOff } />
										{ __( 'Disconnect repository ' ) }
									</MenuItem>
								</MenuGroup>
							</Fragment>
						) }
					</DropdownMenu>
				) }
			</td>
		</tr>
	);
};
