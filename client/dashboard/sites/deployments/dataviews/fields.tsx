import { Badge } from '@automattic/ui';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import TimeSince from '../../../components/time-since';
import { BranchDisplay } from '../components/branch-display';
import {
	DeploymentStatusBadge,
	DeploymentStatusValue,
} from '../components/deployment-status-badge';
import type { DeploymentRunWithDeploymentInfo } from '../hooks/use-code-deployment-runs-query';
import type { Field } from '@wordpress/dataviews';

export function useDeploymentFields(): Field< DeploymentRunWithDeploymentInfo >[] {
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
					return item.metadata?.commit_message || '';
				},
				render: ( { item } ) => {
					if ( ! item.metadata ) {
						return <Text variant="muted">{ __( 'No commit info' ) }</Text>;
					}

					const { commit_message, commit_sha, author } = item.metadata;
					const [ installation, repo ] = item.repository_name.split( '/' );
					const shortSha = commit_sha?.substring( 0, 7 ) || '';

					return (
						<VStack spacing={ 1 }>
							<Text title={ commit_message }>{ commit_message }</Text>
							<HStack spacing={ 3 } alignment="left" style={ { width: 'auto' } }>
								<ExternalLink
									href={ `https://github.com/${ installation }/${ repo }/commit/${ commit_sha }` }
								>
									<Text
										as="code"
										size="small"
										style={ { color: 'var(--wp-admin-theme-color-darker-20)' } }
									>
										{ shortSha }
									</Text>
								</ExternalLink>
								<BranchDisplay branchName={ item.branch_name } />
								<HStack spacing={ 1.5 } alignment="left" style={ { width: 'auto' } }>
									<img
										src={ author.avatar_url }
										alt={ author.name }
										width={ 16 }
										height={ 16 }
										style={ { borderRadius: '50%' } }
									/>
									<Text size="small" style={ { color: '#3b3b3b' } }>
										{ author.name }
									</Text>
								</HStack>
								{ item.is_active_deployment && <Badge>{ __( 'Active deployment' ) }</Badge> }
							</HStack>
						</VStack>
					);
				},
			},
			{
				id: 'status',
				label: __( 'Status' ),
				getValue: ( { item } ) => {
					return item.status;
				},
				elements: [
					{ value: 'pending', label: __( 'Pending' ) },
					{ value: 'queued', label: __( 'Queued' ) },
					{ value: 'running', label: __( 'Deploying' ) },
					{ value: 'success', label: __( 'Deployed' ) },
					{ value: 'failed', label: __( 'Error' ) },
					{ value: 'warnings', label: __( 'Warnings' ) },
					{ value: 'building', label: __( 'Building' ) },
					{ value: 'dispatched', label: __( 'Dispatched' ) },
					{ value: 'unknown', label: __( 'Unknown' ) },
				],
				filterBy: {
					operators: [ 'is' ],
				},
				render: ( { item } ) => {
					return <DeploymentStatusBadge status={ item.status as DeploymentStatusValue } />;
				},
			},
			{
				id: 'created_on',
				label: __( 'Date' ),
				getValue: ( { item } ) => {
					return item.created_on;
				},
				render: ( { item } ) => {
					return <TimeSince timestamp={ item.created_on } />;
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
