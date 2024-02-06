import { Button } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { Icon, lock } from '@wordpress/icons';

interface GitHubAccountListItemProps {
	onSelect(): void;
}

export const GitHubAccountListItem = ( { onSelect }: GitHubAccountListItemProps ) => {
	return (
		<tr>
			<td>
				<div className="github-deployments-repository-list__account">
					@Account <Icon icon={ lock } />
				</div>
			</td>
			<td>1st Feb 2024</td>
			<td>
				<Button primary compact onClick={ onSelect }>
					{ __( 'Select' ) }
				</Button>
			</td>
		</tr>
	);
};
