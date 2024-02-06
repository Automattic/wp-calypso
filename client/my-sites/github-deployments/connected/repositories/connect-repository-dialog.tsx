import { Button, Dialog, FormLabel, Gridicon } from '@automattic/components';
import { ExternalLink, FormToggle, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset/index';
import FormTextInput from 'calypso/components/forms/form-text-input/index';
import { GitHubRepositoryList } from 'calypso/my-sites/github-deployments/connected/repositories/repository-list';
import { SearchRepos } from 'calypso/my-sites/github-deployments/connected/repositories/search-repos';

import './style.scss';

interface ConnectRepositoryDialogProps {
	onClose(): void;
}

const accounts = [
	{
		label: '@mpkelly',
		value: '@mpkely',
	},
	{
		label: '@other',
		value: '@other',
	},
];

const branches = [
	{
		label: 'main',
		value: 'main',
	},
	{
		label: 'other',
		value: 'other',
	},
];

type Tabs = 'list' | 'connect';

export const ConnectRepositoryDialog = ( { onClose }: ConnectRepositoryDialogProps ) => {
	const [ tab, setTab ] = useState< Tabs >( 'list' );

	const [ account, setAccount ] = useState( accounts[ 0 ].value );
	const [ branch, setBranch ] = useState( branches[ 0 ].value );
	const [ destPath, setDestPath ] = useState( '/' );
	const [ isAutoDeploy, setIsAutoDeploy ] = useState( false );

	function goBack() {
		setTab( 'list' );
	}

	function renderListTab() {
		return (
			<>
				<div className="github-deployments-add-repository-dialog__search-bar">
					<SelectControl
						className="github-deployments-add-repository-dialog__select-account"
						value={ account }
						options={ accounts }
						onChange={ setAccount }
					/>
					<SearchRepos siteId={ -1 } connectionId={ -1 } />
				</div>
				<GitHubRepositoryList connections={ [] } onSelect={ () => setTab( 'connect' ) } />
			</>
		);
	}

	function renderConnectTab() {
		return (
			<form>
				<FormFieldset>
					<FormLabel>{ __( 'Repository' ) }</FormLabel>
					<div className="github-deployments-add-repository-dialog__repository">
						<ExternalLink href="https://github.com/mpkelly/partial-atomic-site" target="_blank">
							mpkelly/partial-atomic-site
						</ExternalLink>
						<Button compact onClick={ goBack }>
							{ __( 'Change' ) }
						</Button>
					</div>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ __( 'Deployment branch' ) }</FormLabel>
					<SelectControl value={ branch } options={ branches } onChange={ setBranch } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ __( 'Destination directory' ) }</FormLabel>
					<FormTextInput
						value={ destPath }
						onChange={ ( event ) => setDestPath( event.currentTarget.value ) }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>{ __( 'Automatic deploys' ) }</FormLabel>
					<div className="github-deployments-add-repository-dialog__automatic-deploys">
						<FormToggle
							checked={ isAutoDeploy }
							onChange={ () => setIsAutoDeploy( ! isAutoDeploy ) }
						/>
						<span>{ __( 'Deploy changes on push' ) }</span>
					</div>
				</FormFieldset>
				<div className="github-deployments-add-repository-dialog__connect-button">
					<Button primary>{ __( 'Connect repository' ) }</Button>
				</div>
			</form>
		);
	}

	function renderTab() {
		if ( tab === 'list' ) {
			return renderListTab();
		}
		return renderConnectTab();
	}

	return (
		<Dialog
			additionalClassNames="github-deployments-add-repository-dialog"
			isVisible={ true }
			onClose={ onClose }
			shouldCloseOnEsc={ true }
		>
			<header>
				<span>{ __( 'Connect repository' ) }</span>
				<button onClick={ onClose }>
					<Gridicon icon="cross" />
				</button>
			</header>
			{ renderTab() }
		</Dialog>
	);
};
