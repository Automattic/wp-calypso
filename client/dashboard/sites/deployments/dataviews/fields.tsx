import { Button, __experimentalText as Text } from '@wordpress/components';
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
					return (
						<Button variant="link" style={ { padding: 0, height: 'auto' } }>
							<strong>{ repo }</strong>
						</Button>
					);
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
						<div style={ { display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 } }>
							<Text
								style={ {
									fontWeight: 500,
									lineHeight: '1.4',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								} }
								title={ commit_message }
							>
								{ commit_message }
							</Text>
							<div
								style={ {
									display: 'flex',
									alignItems: 'center',
									gap: '12px',
									fontSize: '12px',
									color: '#646970',
								} }
							>
								<a
									href={ `https://github.com/${ installation }/${ repo }/commit/${ commit_sha }` }
									target="_blank"
									rel="noopener noreferrer"
									style={ {
										fontSize: '12px',
										color: '#3858e9',
										textDecoration: 'none',
										fontFamily: 'Monaco, Consolas, monospace',
									} }
								>
									{ shortSha }
								</a>
								<span
									style={ {
										display: 'flex',
										alignItems: 'center',
										gap: '4px',
									} }
								>
									<svg width="12" height="12" viewBox="0 0 16 16" fill="#646970">
										<path d="M11.75 2.5a.75.75 0 0 0-1.5 0V4H9A.75.75 0 0 0 9 5.5h1.25v1.25a.75.75 0 0 0 1.5 0V5.5H13a.75.75 0 0 0 0-1.5h-1.25V2.5z" />
										<path d="M5.25 4a3.25 3.25 0 1 1 0 6.5 3.25 3.25 0 0 1 0-6.5zm0 1.5a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z" />
										<path d="M5.25 11.25a.75.75 0 0 0-.75.75v1.25a.75.75 0 0 0 1.5 0V12a.75.75 0 0 0-.75-.75z" />
									</svg>
									<Text
										as="code"
										size={ 12 }
										style={ {
											fontFamily: 'Monaco, Consolas, monospace',
											color: '#646970',
										} }
									>
										{ item.branch_name }
									</Text>
								</span>
								<div
									style={ {
										display: 'flex',
										alignItems: 'center',
										gap: '6px',
									} }
								>
									<img
										src={ author.avatar_url }
										alt={ author.name }
										style={ {
											width: '16px',
											height: '16px',
											borderRadius: '50%',
											flexShrink: 0,
										} }
									/>
									<Text size={ 12 } style={ { color: '#646970' } }>
										{ author.name }
									</Text>
								</div>
							</div>
						</div>
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
