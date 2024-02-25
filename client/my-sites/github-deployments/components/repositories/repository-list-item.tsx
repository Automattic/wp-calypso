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
	return (
		<tr>
			<td>
				<span css={ { fontWeight: 500 } }>
					{ repository.name }{ ' ' }
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
