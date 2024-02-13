import { Button } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { Icon, lock } from '@wordpress/icons';
import { GitHubRepositoryData } from '../../use-github-repositories-query';

interface GitHubRepositoryListItemProps {
	repository: GitHubRepositoryData;
	onSelect(): void;
}

export const GitHubRepositoryListItem = ( {
	repository,
	onSelect,
}: GitHubRepositoryListItemProps ) => {
	return (
		<tr>
			<td>
				<div className="github-deployments-repository-list__account">
					{ repository.full_name } { repository.private && <Icon icon={ lock } size={ 16 } /> }
				</div>
			</td>
			<td>{ new Date( repository.updated_at ).toLocaleDateString() }</td>
			<td>
				<Button compact onClick={ onSelect }>
					{ __( 'Select' ) }
				</Button>
			</td>
		</tr>
	);
};
