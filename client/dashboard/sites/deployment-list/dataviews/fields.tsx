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
import { BranchDisplay } from '../branch-display';
import { DeploymentStatusBadge, DeploymentStatusValue } from '../deployment-status-badge';
import type { DeploymentRunWithDeploymentInfo } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

interface FilterOptions {
	repositoryOptions: { value: string; label: string }[];
	userNameOptions: { value: string; label: string }[];
}

export function useDeploymentFields( {
	repositoryOptions = [],
	userNameOptions = [],
}: FilterOptions ): Field< DeploymentRunWithDeploymentInfo >[] {
	return useMemo(
		() => [
			{
				id: 'repository_name',
				label: __( 'Repository' ),
				enableHiding: false,
				enableGlobalSearch: true,
				elements: repositoryOptions,
				filterBy: {
					operators: [ 'isAny' ],
				},
				getValue: ( { item } ) => item.repository_name,
				render: ( { item } ) => {
					const [ , repo ] = item.repository_name.split( '/' );
					return <Text>{ repo }</Text>;
				},
			},
			{
				id: 'commit',
				label: __( 'Commits' ),
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
				id: 'user_name',
				label: __( 'User name' ),
				enableGlobalSearch: true,
				elements: userNameOptions,
				filterBy: {
					operators: [ 'isAny' ],
				},
				getValue: ( { item } ) => {
					return item.metadata?.author?.name || '';
				},
				render: ( { item } ) => {
					if ( ! item.metadata?.author ) {
						return <Text variant="muted">{ __( 'Unknown' ) }</Text>;
					}
					return <Text>{ item.metadata.author.name }</Text>;
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
				id: 'is_active_deployment',
				type: 'boolean',
				label: __( 'Active deployment' ),
				elements: [
					{ value: true, label: __( 'Active' ) },
					{ value: false, label: __( 'Not active' ) },
				],
				filterBy: {
					operators: [ 'is' ],
				},
				getValue: ( { item } ) => {
					return item.is_active_deployment || false;
				},
				render: ( { item } ) => ( item.is_active_deployment ? __( 'Active' ) : __( 'Not active' ) ),
			},
		],
		[ repositoryOptions, userNameOptions ]
	);
}
