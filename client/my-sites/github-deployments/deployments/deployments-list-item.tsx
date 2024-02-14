import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem, Spinner } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useSelector } from '../../../state';
import { manageDeploymentPage } from '../routes';
import { CodeDeploymentData } from './use-code-deployments-query';
import { useDeleteCodeDeployment } from './use-delete-code-deployment';

interface GitHubRepositoryListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsListItem = ( { deployment }: GitHubRepositoryListItemProps ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	const { deleteDeployment, isPending } = useDeleteCodeDeployment(
		deployment.blog_id,
		deployment.id
	);

	return (
		<tr>
			<td>
				<div className="github-deployments-repository-list__account">
					{ deployment.repository_name }
				</div>
			</td>
			<td>
				<span>Last commit</span>
			</td>
			<td>
				<span>Status</span>
			</td>
			<td>
				<span>{ new Date( deployment.updated_on ).toLocaleDateString() }</span>
			</td>
			<td>
				<span>Duration</span>
			</td>
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
											page( manageDeploymentPage( siteSlug!, deployment.id ) );
											onClose();
										} }
									>
										{ __( 'Configure repository' ) }
									</MenuItem>
								</MenuGroup>
								<MenuGroup>
									<MenuItem
										onClick={ () => {
											deleteDeployment();
											onClose();
										} }
									>
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
