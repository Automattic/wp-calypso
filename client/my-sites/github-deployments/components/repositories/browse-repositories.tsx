import { Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps, useState } from 'react';
import { GitHubInstallationsDropdown } from '../installations-dropdown';
import { useLiveInstallations } from '../installations-dropdown/use-live-installations';
import { GitHubLoadingPlaceholder } from '../loading-placeholder';
import { GitHubBrowseRepositoriesList } from './repository-list';
import { SearchRepos } from './search-repos';

import './style.scss';

type GitHubBrowseRepositoriesProps = {
	initialInstallationId?: number;
} & Pick< ComponentProps< typeof GitHubBrowseRepositoriesList >, 'onSelectRepository' >;

export const GitHubBrowseRepositories = ( {
	initialInstallationId,
	onSelectRepository,
}: GitHubBrowseRepositoriesProps ) => {
	const { __ } = useI18n();
	const {
		installation,
		setInstallation,
		installations,
		onNewInstallationRequest,
		isLoadingInstallations,
	} = useLiveInstallations( {
		initialInstallationId: initialInstallationId,
	} );

	const [ query, setQuery ] = useState( '' );

	function handleQueryChange( query: string ) {
		setQuery( query );
	}

	const renderContent = () => {
		if ( installation ) {
			return (
				<GitHubBrowseRepositoriesList
					onSelectRepository={ onSelectRepository }
					installation={ installation }
					query={ query }
				/>
			);
		}

		if ( isLoadingInstallations ) {
			return <GitHubLoadingPlaceholder />;
		}

		if ( ! installation ) {
			return (
				<Card css={ { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 0 } }>
					<span>{ __( 'Get started by adding a GitHub account.' ) }</span>
				</Card>
			);
		}
	};

	return (
		<div className="github-deployments-repositories">
			<div className="github-deployments-repositories__search-bar">
				<GitHubInstallationsDropdown
					onAddInstallation={ onNewInstallationRequest }
					installations={ installations }
					value={ installation }
					onChange={ setInstallation }
				/>
				<SearchRepos value={ query } onChange={ handleQueryChange } />
			</div>
			{ renderContent() }
		</div>
	);
};
