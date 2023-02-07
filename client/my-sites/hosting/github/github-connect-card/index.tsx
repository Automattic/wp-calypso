import { Button, Card, Spinner } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSelect from 'calypso/components/forms/form-select';
import FormTextInput from 'calypso/components/forms/form-text-input';
import SocialLogo from 'calypso/components/social-logo';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { RepoBranch, useGithubBranches } from './use-github-branches';
import { Repo, useGithubRepos } from './use-github-repos';

import './style.scss';

export const GithubConnectCard = () => {
	const siteId = useSelector( getSelectedSiteId );

	const [ selectedRepo, setSelectedRepo ] = useState< Repo >();
	const [ selectedBranch, setSelectedBranch ] = useState< RepoBranch >();
	const { data: repos, isLoading: isLoadingRepos } = useGithubRepos( siteId );
	const { data: branches, isLoading: isLoadingBranches } = useGithubBranches(
		siteId,
		selectedRepo?.name
	);

	useEffect( () => {
		if ( repos ) {
			setSelectedRepo( selectedRepo || repos[ 0 ] );
		}
		if ( branches ) {
			setSelectedBranch( branches[ 0 ] );
		}
	}, [ repos, branches, selectedRepo ] );

	const showSpinner = ! repos && ! branches && ( isLoadingRepos || isLoadingBranches );

	const handleRepoSelect = ( repoName: string ) => {
		const selectedRepo = repos?.find( ( repo ) => repo.full_name === repoName );
		setSelectedRepo( selectedRepo );
	};

	const handleBranchSelect = ( branchName: string ) => {
		const selectedBranch = branches?.find( ( branch ) => branch.name === branchName );
		setSelectedBranch( selectedBranch );
	};

	return (
		<Card className="connect-branch-card">
			<SocialLogo className="material-icon" icon="github" size={ 32 } />
			<CardHeading>{ __( 'Connect Branch' ) }</CardHeading>
			<div>
				<p>{ __( 'Changes pushed to connected branch will be deployed automatically' ) }</p>
				{ ! showSpinner ? (
					<FormFieldset className="connect-branch__fields">
						<FormSelect
							id="repositories"
							className="connect-branch__field"
							onChange={ ( event ) => handleRepoSelect( event.currentTarget.value ) }
							value={ selectedRepo?.full_name }
						>
							{ repos?.map( ( repo ) => (
								<option value={ repo.full_name } key={ repo.name }>
									{ repo.full_name }
								</option>
							) ) }
						</FormSelect>
						<FormSelect
							id="branches"
							className="connect-branch__field"
							onChange={ ( event ) => handleBranchSelect( event.currentTarget.value ) }
							value={ selectedBranch?.name }
						>
							{ branches?.map( ( branch ) => (
								<option value={ branch.name } key={ branch.name }>
									{ branch.name }
								</option>
							) ) }
						</FormSelect>
						<Button
							primary
							busy={ isLoadingBranches }
							className="connect-branch__field"
							disabled={ isLoadingBranches }
						>
							<span>{ __( 'Connect' ) }</span>
						</Button>
					</FormFieldset>
				) : (
					<Spinner />
				) }
				<div>
					<span>
						<strong>{ __( 'Root Directory' ) }</strong>
						<small>
							{ __(
								'(you can specify a root directory and only changes in that directory will be deployed)'
							) }
						</small>
					</span>
					<FormTextInput id="root_path" placeholder="/wp-content" />
				</div>
			</div>
		</Card>
	);
};
