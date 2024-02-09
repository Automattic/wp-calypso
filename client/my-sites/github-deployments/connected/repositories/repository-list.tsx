import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { GitHubRepositoryListItem } from './repository-list-item';

interface GitHubAccountListProps {
	repositories: GitHubRepositoryData[];
	onSelect( repository: GitHubRepositoryData ): void;
}

export const GitHubRepositoryList = ( { repositories, onSelect }: GitHubAccountListProps ) => {
	return (
		<div className="github-deployments-repository-list">
			<table>
				<thead>
					<tr>
						<th>{ __( 'Repository' ) }</th>
						<th>{ __( 'Last Updated ' ) }</th>
						<th> </th>
					</tr>
				</thead>
				<tbody>
					{ repositories.map( ( repository, index ) => (
						<GitHubRepositoryListItem
							key={ index }
							repository={ repository }
							onSelect={ () => onSelect( repository ) }
						/>
					) ) }
				</tbody>
			</table>
			<p className="github-deployments-adjust-permissions">
				{ __( 'Missing some repositories?' ) }{ ' ' }
				<ExternalLink href="#"> { __( 'Adjust permissions on GitHub' ) } </ExternalLink>
			</p>
		</div>
	);
};
