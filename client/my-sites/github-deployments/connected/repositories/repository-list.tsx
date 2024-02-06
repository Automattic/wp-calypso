import { __ } from '@wordpress/i18n';
import { GitHubInstallation } from 'calypso/my-sites/github-deployments/types';
import { GitHubAccountListItem } from './repository-list-item';

interface GitHubAccountListProps {
	connections: GitHubInstallation[];
	onSelect(): void;
}

export const GitHubRepositoryList = ( { connections = [], onSelect }: GitHubAccountListProps ) => {
	return (
		<div>
			<table className="github-deployments-repository-list">
				<thead>
					<tr>
						<th>{ __( 'Repository' ) }</th>
						<th>{ __( 'Last Updated ' ) }</th>
						<th> </th>
					</tr>
				</thead>
				<tbody>
					{ connections.map( ( connection ) => (
						<GitHubAccountListItem key={ connection.ID } connection={ connection } />
					) ) }
					<GitHubAccountListItem onSelect={ onSelect } />
					<GitHubAccountListItem onSelect={ onSelect } />
					<GitHubAccountListItem onSelect={ onSelect } />
					<GitHubAccountListItem onSelect={ onSelect } />
					<GitHubAccountListItem onSelect={ onSelect } />
				</tbody>
			</table>
		</div>
	);
};
