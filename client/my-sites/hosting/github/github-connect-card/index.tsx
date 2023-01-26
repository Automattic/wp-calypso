import { Button, Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import request from 'wpcom-proxy-request';
import CardHeading from 'calypso/components/card-heading/index';
import SelectDropdown from 'calypso/components/select-dropdown/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import iconGitHub from '../github.svg';

type Repo = {
	name: string;
};

type RepoBranch = {
	name: string;
};

export const GithubConnectCard = () => {
	const { __ } = useI18n();
	const [ repos, setRepos ] = useState< Repo[] >( [] );
	const [ selectedRepo, setSelectedRepo ] = useState< Repo | undefined >( undefined );
	const [ branches, setBranches ] = useState< RepoBranch[] >( [] );
	const [ selectedBranch, setSelectedBranch ] = useState< RepoBranch | undefined >( undefined );

	const siteId = useSelector( getSelectedSiteId );

	useEffect( () => {
		request< Repo[] >( {
			path: `/sites/${ siteId }/hosting/github/repos`,
			apiNamespace: 'wpcom/v2',
		} ).then( ( result ) => {
			setRepos( result );
		} );
	}, [ siteId ] );

	const fetchBranches = async ( repo: Repo ) => {
		const result = await request< RepoBranch[] >( {
			path: `/sites/${ siteId }/hosting/github/branches?repo=${ repo.name }`,
			apiNamespace: 'wpcom/v2',
		} );
		setBranches( result );
	};

	const handleRepoChange = ( repo: Repo ) => {
		setSelectedRepo( repo );
		setSelectedBranch( undefined );
		fetchBranches( repo );
	};

	const handleBranchChange = ( branch: RepoBranch ) => {
		setSelectedBranch( branch );
	};

	const handleConnect = async () => {
		const path = `/sites/${ siteId }/hosting/github/connect?repo=${ selectedRepo?.name }`;
		request( {
			path,
			apiNamespace: 'wpcom/v2',
		} );
	};

	return (
		<Card className="github-authorize-card">
			<img className="github-authorize-icon" src={ iconGitHub } alt="" />
			<CardHeading>{ __( 'Connect Branch' ) }</CardHeading>
			<div style={ { display: 'flex', alignItems: 'center', gap: 16 } }>
				<SelectDropdown selectedText={ selectedRepo?.name }>
					{ repos.map( ( repo ) => (
						<SelectDropdown.Item
							key={ repo.name }
							selected={ repo.name === selectedRepo?.name }
							onClick={ () => handleRepoChange( repo ) }
						>
							{ repo.name }
						</SelectDropdown.Item>
					) ) }
				</SelectDropdown>

				<SelectDropdown selectedText={ selectedBranch?.name }>
					{ branches.map( ( branch ) => (
						<SelectDropdown.Item
							key={ branch.name }
							selected={ branch.name === selectedBranch?.name }
							onClick={ () => handleBranchChange( branch ) }
						>
							{ branch.name }
						</SelectDropdown.Item>
					) ) }
				</SelectDropdown>

				<Button disabled={ ! selectedRepo } primary onClick={ handleConnect }>
					__( 'Connect' )
				</Button>
			</div>
		</Card>
	);
};
