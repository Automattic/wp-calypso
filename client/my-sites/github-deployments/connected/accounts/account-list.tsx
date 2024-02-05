import { __ } from '@wordpress/i18n';
import { GitHubConnection } from 'calypso/my-sites/github-deployments/types';
import { GitHubAccountListItem } from './account-list-item';

interface GitHubAccountListProps {
	connections: GitHubConnection[];
}

export const GitHubAccountList = ( { connections = [] }: GitHubAccountListProps ) => {
	return (
		<div>
			<table>
				<thead>
					<tr>
						<th>{ __( 'Name' ) }</th>
						<th>{ __( ' Repository Access ' ) }</th>
						<th>{ __( 'Connected on' ) } </th>
						<th> </th>
					</tr>
				</thead>
				<tbody>
					{ connections.map( ( connection ) => (
						<GitHubAccountListItem key={ connection.ID } connection={ connection } />
					) ) }
				</tbody>
			</table>
		</div>
	);
};
