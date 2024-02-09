import { SelectDropdown } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { GitHubAccountData } from '../../use-github-accounts-query';

import './style.scss';

interface GitHubAccountsDropdown {
	accounts: GitHubAccountData[];
	value: GitHubAccountData;
	onChange( value: GitHubAccountData ): void;
}

export const GitHubAccountsDropdown = ( { accounts, value, onChange }: GitHubAccountsDropdown ) => {
	return (
		<SelectDropdown
			className="github-deployments-accounts-select"
			selectedText={ value.account_name }
		>
			{ accounts.map( ( account ) => (
				<SelectDropdown.Item
					key={ account.account_name }
					selected={ value.account_name === account.account_name }
					onClick={ () => onChange( account ) }
				>
					{ account.account_name }
				</SelectDropdown.Item>
			) ) }
			<SelectDropdown.Separator />
			<SelectDropdown.Item key="add">
				<ExternalLink href="/me" target="__blank">
					{ __( 'Add GitHub account ' ) }
				</ExternalLink>
			</SelectDropdown.Item>
		</SelectDropdown>
	);
};
