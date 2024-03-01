import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { Icon, lock } from '@wordpress/icons';
import { formatDate } from 'calypso/my-sites/github-deployments/utils/dates';
import { GitHubRepositoryData } from '../../use-github-repositories-query';

interface GitHubRepositoryListItemProps {
	repository: GitHubRepositoryData;
	onSelect(): void;
}

export const GitHubRepositoryListItem = ( {
	repository,
	onSelect,
}: GitHubRepositoryListItemProps ) => {
	const locale = useLocale();

	const repoUrl = `https://github.com/${ repository.owner }/${ repository.name }`;

	return (
		<tr>
			<td>
				<span css={ { fontWeight: 500 } }>
					<a
						className="github-deployments-repository-list-table__repo-name"
						href={ repoUrl }
						target="_blank"
						rel="noopener noreferrer"
					>
						{ repository.name }
					</a>{ ' ' }
					{ repository.private && (
						<Icon icon={ lock } size={ 16 } css={ { verticalAlign: 'middle' } } />
					) }
				</span>
			</td>
			<td>{ formatDate( locale, new Date( repository.updated_at ) ) }</td>
			<td>
				<Button compact onClick={ onSelect }>
					{ __( 'Select' ) }
				</Button>
			</td>
		</tr>
	);
};
