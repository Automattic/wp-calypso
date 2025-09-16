import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import {
	Modal,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { deploymentRunLogsQuery } from '../../../app/queries/deployment-logs';
import { BranchDisplay } from '../branch-display';
import { DeploymentLogsEntry } from './deployment-logs-entry';
import type { DeploymentRunWithDeploymentInfo } from '@automattic/api-core';

interface DeploymentLogsModalProps {
	isOpen: boolean;
	onRequestClose: () => void;
	deployment: DeploymentRunWithDeploymentInfo;
	siteId: number;
}

export function DeploymentLogsModal( {
	isOpen,
	onRequestClose,
	deployment,
	siteId,
}: DeploymentLogsModalProps ) {
	const {
		data: logEntries = [],
		isLoading,
		isError,
	} = useQuery( {
		...deploymentRunLogsQuery( siteId, deployment.code_deployment_id, deployment.id ),
		enabled: isOpen,
	} );

	if ( ! isOpen ) {
		return null;
	}
	const { commit_message, commit_sha, author } = deployment.metadata;
	const shortSha = commit_sha?.substring( 0, 7 ) || '';

	return (
		<Modal
			title={ `${ shortSha } ${ commit_message }` }
			onRequestClose={ onRequestClose }
			className="deployment-logs-modal"
			shouldCloseOnClickOutside
			shouldCloseOnEsc
		>
			<HStack spacing={ 3 } justify="flex-start" style={ { width: 'auto', marginBottom: '16px' } }>
				{ deployment.is_active_deployment && (
					<Badge style={ { flexShrink: 0 } }>{ __( 'Active deployment' ) }</Badge>
				) }

				<BranchDisplay branchName="add/dotdash-373-deployments-github-logs" />

				<HStack spacing={ 1.5 } alignment="left">
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
			</HStack>

			{ isLoading && (
				<div className="deployment-logs-modal__loading">{ __( 'Loading deployment logs…' ) }</div>
			) }
			{ isError && (
				<div className="deployment-logs-modal__error">
					{ __( 'Failed to load deployment logs. Please try again.' ) }
				</div>
			) }
			{ logEntries.length === 0 && (
				<div className="deployment-logs-modal__empty">
					{ __( 'No logs available for this deployment.' ) }
				</div>
			) }

			{ logEntries.length > 0 && (
				<VStack
					style={ {
						width: '100%',
						padding: '16px',
						backgroundColor: 'var(--dashboard__text-color)',
						borderRadius: '4px',
					} }
				>
					{ logEntries.map( ( entry, index ) => (
						<DeploymentLogsEntry
							key={ `${ entry.message }-${ index }` }
							entry={ entry }
							deployment={ deployment }
							siteId={ siteId }
						/>
					) ) }
				</VStack>
			) }
		</Modal>
	);
}
