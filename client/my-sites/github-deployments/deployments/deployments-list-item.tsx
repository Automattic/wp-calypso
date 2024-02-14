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
import { formatDate } from 'calypso/my-sites/github-deployments/utils/Dates';
import { useLocale } from '@automattic/i18n-utils';

interface GitHubRepositoryListItemProps {
	deployment: CodeDeploymentData;
}

export const DeploymentsListItem = ( { deployment }: GitHubRepositoryListItemProps ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const locale = useLocale();

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
				<span>{ formatDate( locale, new Date( deployment.updated_on ) ) }</span>
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
										{ __( 'Trigger manual deploy' ) }
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
