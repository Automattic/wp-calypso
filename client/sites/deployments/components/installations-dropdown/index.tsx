import { SelectDropdown } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import {
	GitHubInstallationData,
	useGithubInstallationsQuery,
} from '../../use-github-installations-query';

import './style.scss';

interface GitHubInstallationsDropdown {
	installations: GitHubInstallationData[];
	onAddInstallation(): void;
	value?: GitHubInstallationData;
	onChange( value: GitHubInstallationData ): void;
}

export const GitHubInstallationsDropdown = ( {
	onAddInstallation,
	installations,
	value,
	onChange,
}: GitHubInstallationsDropdown ) => {
	const { __ } = useI18n();

	const { isFetching } = useGithubInstallationsQuery();

	return (
		<SelectDropdown
			className="github-deployments-installations-select"
			selectedText={ value?.account_name || __( 'Select account' ) }
			isLoading={ isFetching }
			disabled={ ! installations.length }
		>
			{ installations.map( ( installation ) => (
				<SelectDropdown.Item
					key={ installation.account_name }
					selected={ value?.account_name === installation.account_name }
					onClick={ () => onChange( installation ) }
				>
					{ installation.account_name }
				</SelectDropdown.Item>
			) ) }
			<SelectDropdown.Separator />
			<SelectDropdown.Item onClick={ onAddInstallation } key="add">
				{ __( 'Add GitHub account' ) }
			</SelectDropdown.Item>
		</SelectDropdown>
	);
};
