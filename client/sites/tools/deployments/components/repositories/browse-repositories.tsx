import { Card, Gridicon } from '@automattic/components';
import { Button, SearchControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps, useState } from 'react';
import { GitHubInstallationsDropdown } from '../installations-dropdown';
import { useLiveInstallations } from '../installations-dropdown/use-live-installations';
import { GitHubLoadingPlaceholder } from '../loading-placeholder';
import { GitHubBrowseRepositoriesList } from './repository-list';

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
				<Card
					css={ {
						display: 'flex',
						flexDirection: 'column',
						boxShadow: 'none',
						alignItems: 'center',
						margin: 0,
						textAlign: 'center',
						gap: '16px',
						padding: '0',
						flexGrow: 1,
						justifyContent: 'center',
						paddingBottom: '32px',
					} }
				>
					<span css={ { paddingInline: '32px' } }>
						{ __(
							'To access your repositories, install the WordPress.com app on your GitHub account and grant it the necessary permissions.'
						) }
					</span>
					<Button variant="primary" onClick={ onNewInstallationRequest }>
						{ __( 'Install the WordPress.com app' ) }
						<Gridicon css={ { marginLeft: '4px' } } icon="external" size={ 18 } />
					</Button>
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
				<SearchControl
					css={ { flex: 1 } }
					__nextHasNoMarginBottom
					placeholder={ __( 'Search repositories' ) }
					value={ query }
					onChange={ handleQueryChange }
				/>
			</div>
			{ renderContent() }
		</div>
	);
};
