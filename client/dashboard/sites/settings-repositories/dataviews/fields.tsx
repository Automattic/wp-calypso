import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { BranchDisplay } from '../../deployment-list/branch-display';
import { OwnerDisplay } from '../owner-display';
import { TargetDirDisplay } from '../target-dir-display';
import type { CodeDeploymentData } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export function useRepositoryFields() {
	return useMemo(
		(): Field< CodeDeploymentData >[] => [
			{
				id: 'repository',
				label: __( 'Repository' ),
				getValue: ( { item } ) => item.repository_name,
				render: ( { item } ) => {
					const [ , repoName ] = item.repository_name.split( '/' );
					const displayRepoName = repoName || item.repository_name;

					return (
						<div style={ { fontWeight: 600, fontSize: '14px', lineHeight: '20px' } }>
							{ displayRepoName }
						</div>
					);
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'owner',
				label: __( 'Owner' ),
				getValue: ( { item } ) => item.repository_name.split( '/' )[ 0 ],
				render: ( { item } ) => {
					const [ owner ] = item.repository_name.split( '/' );
					return <OwnerDisplay owner={ owner } />;
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'branch',
				label: __( 'Branch' ),
				getValue: ( { item } ) => item.branch_name,
				render: ( { item } ) => {
					return <BranchDisplay branchName={ item.branch_name } />;
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'target_dir',
				label: __( 'Target Directory' ),
				getValue: ( { item } ) => item.target_dir,
				render: ( { item } ) => <TargetDirDisplay targetDir={ item.target_dir } />,
				enableHiding: true,
				enableSorting: true,
			},
			{
				id: 'auto_deploy',
				label: __( 'Auto Deploy' ),
				getValue: ( { item } ) => ( item.is_automated ? 'On' : 'Off' ),
				render: ( { item } ) => (
					<Text size="small" style={ { color: '#3b3b3b' } }>
						{ item.is_automated ? __( 'Auto Deploy: On' ) : __( 'Auto Deploy: Off' ) }
					</Text>
				),
				enableHiding: true,
				enableSorting: true,
			},
		],
		[]
	);
}
