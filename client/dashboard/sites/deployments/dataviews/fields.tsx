import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import TimeSince from '../../../components/time-since';
import {
	DeploymentStatusBadge,
	DeploymentStatusValue,
} from '../components/deployment-status-badge';
import type { CodeDeploymentData } from '../hooks/use-code-deployments-query';
import type { Field } from '@wordpress/dataviews';

export function useDeploymentFields(): Field< CodeDeploymentData >[] {
	return useMemo(
		() => [
			{
				id: 'repository_name',
				label: __( 'Repository' ),
				enableHiding: false,
				enableGlobalSearch: true,
				getValue: ( { item } ) => item.repository_name,
				render: ( { item } ) => {
					const [ , repo ] = item.repository_name.split( '/' );
					return <Text>{ repo }</Text>;
				},
			},
			{
				id: 'commit',
				label: __( 'Commit' ),
				enableGlobalSearch: true,
				enableSorting: false,
				getValue: ( { item } ) => {
					const run = item.current_deployment_run || item.current_deployed_run;
					return run?.metadata?.commit_message || '';
				},
				render: ( { item } ) => {
					const run = item.current_deployment_run || item.current_deployed_run;
					if ( ! run?.metadata ) {
						return <Text variant="muted">{ __( 'No commit info' ) }</Text>;
					}

					const { commit_message, commit_sha, author } = run.metadata;
					const [ installation, repo ] = item.repository_name.split( '/' );
					const shortSha = commit_sha?.substring( commit_sha.length - 7 ) || '';

					return (
						<VStack spacing={ 1 }>
							<Text title={ commit_message }>{ commit_message }</Text>
							<HStack spacing={ 3 } alignment="left">
								<a
									href={ `https://github.com/${ installation }/${ repo }/commit/${ commit_sha }` }
									target="_blank"
									rel="noopener noreferrer"
								>
									<Text as="code">{ shortSha }</Text>
								</a>
								<HStack spacing={ 1 } alignment="left">
									<svg width="12" height="12" viewBox="0 0 16 16" fill="#646970">
										<path d="M11.75 2.5a.75.75 0 0 0-1.5 0V4H9A.75.75 0 0 0 9 5.5h1.25v1.25a.75.75 0 0 0 1.5 0V5.5H13a.75.75 0 0 0 0-1.5h-1.25V2.5z" />
										<path d="M5.25 4a3.25 3.25 0 1 1 0 6.5 3.25 3.25 0 0 1 0-6.5zm0 1.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z" />
										<path d="M5.25 11.25a.75.75 0 0 0-.75.75v1.25a.75.75 0 0 0 1.5 0V12a.75.75 0 0 0-.75-.75z" />
									</svg>
									<Text as="code" variant="muted">
										{ item.branch_name }
									</Text>
								</HStack>
								<HStack spacing={ 1.5 } alignment="left">
									<img
										src={ author.avatar_url }
										alt={ author.name }
										width={ 14 }
										height={ 14 }
										style={ { borderRadius: '50%' } }
									/>
									<Text variant="muted">{ author.name }</Text>
								</HStack>
							</HStack>
						</VStack>
					);
				},
			},
			{
				id: 'status',
				label: __( 'Status' ),
				getValue: ( { item } ) => {
					const run = item.current_deployment_run || item.current_deployed_run;
					return run?.status || 'no-runs';
				},
				elements: [
					{ value: 'pending', label: __( 'Pending' ) },
					{ value: 'queued', label: __( 'Queued' ) },
					{ value: 'running', label: __( 'Deploying' ) },
					{ value: 'success', label: __( 'Deployed' ) },
					{ value: 'failed', label: __( 'Error' ) },
					{ value: 'warnings', label: __( 'Warnings' ) },
					{ value: 'building', label: __( 'Building' ) },
					{ value: 'no-runs', label: __( 'No deployments' ) },
				],
				filterBy: {
					operators: [ 'is' ],
				},
				render: ( { item } ) => {
					const run = item.current_deployment_run || item.current_deployed_run;
					if ( ! run ) {
						return <Text variant="muted">{ __( 'No deployments' ) }</Text>;
					}
					return <DeploymentStatusBadge status={ run.status as DeploymentStatusValue } />;
				},
			},
			{
				id: 'updated_on',
				label: __( 'Date' ),
				getValue: ( { item } ) => {
					const run = item.current_deployment_run || item.current_deployed_run;
					return run?.updated_on || item.updated_on;
				},
				render: ( { item } ) => {
					const run = item.current_deployment_run || item.current_deployed_run;
					const timestamp = run?.updated_on || item.updated_on;
					return <TimeSince timestamp={ timestamp } />;
				},
			},

			{
				id: 'is_automated',
				type: 'boolean',
				label: __( 'Automated' ),
				elements: [
					{ value: true, label: __( 'Yes' ) },
					{ value: false, label: __( 'No' ) },
				],
				filterBy: {
					operators: [ 'is' ],
				},
				render: ( { item } ) => ( item.is_automated ? __( 'Yes' ) : __( 'No' ) ),
			},
		],
		[]
	);
}
