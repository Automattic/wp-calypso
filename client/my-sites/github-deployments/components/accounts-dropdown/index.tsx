import { Button, SelectDropdown } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { GitHubAccountData, useGithubAccountsQuery } from '../../use-github-accounts-query';

import './style.scss';

interface GitHubAccountsDropdown {
	accounts: GitHubAccountData[];
	onAddAccount(): void;
	value?: GitHubAccountData;
	onChange( value: GitHubAccountData ): void;
}

export const GitHubAccountsDropdown = ( {
	onAddAccount,
	accounts,
	value,
	onChange,
}: GitHubAccountsDropdown ) => {
	const { __ } = useI18n();

	const { isFetching } = useGithubAccountsQuery();

	if ( accounts.length > 0 ) {
		return (
			<SelectDropdown
				className="github-deployments-accounts-select"
				selectedText={ value?.account_name }
				isLoading={ isFetching }
			>
				{ accounts.map( ( account ) => (
					<SelectDropdown.Item
						key={ account.account_name }
						selected={ value?.account_name === account.account_name }
						onClick={ () => onChange( account ) }
					>
						{ account.account_name }
					</SelectDropdown.Item>
				) ) }
				<SelectDropdown.Separator />
				<SelectDropdown.Item onClick={ onAddAccount } key="add">
					{ __( 'Add GitHub account' ) }
				</SelectDropdown.Item>
			</SelectDropdown>
		);
	}

	return (
		<Button busy={ isFetching } disabled={ isFetching } primary onClick={ onAddAccount } key="add">
			{ __( 'Add GitHub account' ) }
		</Button>
	);
};
