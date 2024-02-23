import page from '@automattic/calypso-router';
import { Card, Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps, useState } from 'react';
import { createRepositoryPage } from 'calypso/my-sites/github-deployments/routes';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';
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
	const siteSlug = useSelector( getSelectedSiteSlug );

	const { __ } = useI18n();
	const { installation, setInstallation, installations, onNewInstallationRequest } =
		useLiveInstallations( {
			initialInstallationId: initialInstallationId,
		} );

	const [ query, setQuery ] = useState( '' );

	function handleCreateRepository() {
		page( createRepositoryPage( siteSlug! ) );
	}

	function handleQueryChange( query: string ) {
		setQuery( query );
	}

	const renderContent = () => {
		if ( ! installations ) {
			return <GitHubLoadingPlaceholder />;
		}

		if ( ! installation ) {
			return (
				<Card css={ { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 0 } }>
					<span>{ __( 'Add a GitHub installation to import an existing repository.' ) }</span>
				</Card>
			);
		}

		return (
			<GitHubBrowseRepositoriesList
				onSelectRepository={ onSelectRepository }
				installation={ installation }
				query={ query }
			/>
		);
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
				<Button onClick={ handleCreateRepository } css={ { marginLeft: 'auto' } }>
					{ __( 'Create new repository' ) }
				</Button>
			</div>
			{ renderContent() }
		</div>
	);
};
