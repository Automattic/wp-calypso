import { Gridicon } from '@automattic/components';
import { DropdownMenu, MenuGroup, MenuItem, Spinner } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDeleteCodeDeployment } from 'calypso/my-sites/github-deployments/deployments/use-delete-code-deployment';
import { CodeDeploymentData } from 'calypso/my-sites/github-deployments/use-code-deployments-query';

interface GitHubRepositoryListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsListItem = ( { deployment }: GitHubRepositoryListItemProps ) => {
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
									<MenuItem onClick={ onClose }>Item 1</MenuItem>
									<MenuItem onClick={ onClose }>Item 2</MenuItem>
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
