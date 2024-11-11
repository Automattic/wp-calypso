import page from '@automattic/calypso-router';
import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { Operator } from '@wordpress/dataviews';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import { PLUGINS_STATUS } from 'calypso/state/plugins/installed/status/constants';
import { manageDeploymentPage, viewDeploymentLogs } from '../routes';
import { formatDate } from '../utils/dates';
import { DeploymentCommitDetails } from './deployment-commit-details';
import { DeploymentDuration } from './deployment-duration';
import { DeploymentStatus, DeploymentStatusValue } from './deployment-status';
import { CodeDeploymentData } from './use-code-deployments-query';

export function useFields( siteSlug?: string ) {
	const locale = useLocale();

	const fields = useMemo(
		() => [
			{
				id: 'repository',
				label: translate( 'Repository' ),
				getValue: ( { item }: { item: CodeDeploymentData } ) => item.repository_name,
				enableGlobalSearch: true,
				render: ( { item }: { item: CodeDeploymentData } ) => {
					const [ installation, repo ] = item.repository_name.split( '/' );

					return (
						<>
							<Button
								onClick={ () => {
									page( manageDeploymentPage( siteSlug!, item.id ) );
								} }
							>
								{ repo }
							</Button>
							<span>{ installation }</span>
						</>
					);
				},
				enableSorting: true,
			},
			{
				id: 'last-commit',
				label: translate( 'Last commit' ),
				enableHiding: false,
				render: ( { item }: { item: CodeDeploymentData } ) => {
					return (
						item?.current_deployment_run && (
							<DeploymentCommitDetails run={ item.current_deployment_run } deployment={ item } />
						)
					);
				},
			},
			{
				id: 'status',
				label: translate( 'Status' ),
				getValue: ( { item }: { item: CodeDeploymentData } ) => {
					return item.current_deployment_run?.status;
				},
				render: ( { item }: { item: CodeDeploymentData } ) => {
					return (
						item?.current_deployment_run && (
							<DeploymentStatus
								status={ item.current_deployment_run?.status as DeploymentStatusValue }
								href={ viewDeploymentLogs( siteSlug!, item.id ) }
							/>
						)
					);
				},
				elements: [
					{
						value: PLUGINS_STATUS.ACTIVE,
						label: translate( 'Active' ),
					},
					{
						value: PLUGINS_STATUS.INACTIVE,
						label: translate( 'Inactive' ),
					},
					{
						value: PLUGINS_STATUS.UPDATE,
						label: translate( 'Needs update' ),
					},
				],
				filterBy: {
					operators: [ 'is' as Operator ],
					isPrimary: true,
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'date',
				label: translate( 'Date' ),
				getValue: ( { item }: { item: CodeDeploymentData } ) => {
					return item?.current_deployment_run?.created_on;
				},
				enableHiding: false,
				render: ( { item }: { item: CodeDeploymentData } ) => {
					return formatDate( locale, new Date( item?.current_deployment_run?.created_on || 0 ) );
				},
			},
			{
				id: 'duration',
				label: translate( 'Duration' ),
				getValue: ( { item }: { item: CodeDeploymentData } ) => {
					return item?.current_deployment_run?.created_on;
				},
				enableHiding: false,
				render: ( { item }: { item: CodeDeploymentData } ) => {
					return (
						item?.current_deployment_run && (
							<DeploymentDuration run={ item.current_deployment_run } />
						)
					);
				},
			},
		],
		[ locale, siteSlug ]
	);

	return fields;
}
