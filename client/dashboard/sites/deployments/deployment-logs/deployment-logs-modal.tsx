import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	Modal,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { formatDate } from '../../../utils/datetime';
import { BranchDisplay } from '../branch-display';
import { DeploymentLogsEntry } from './deployment-logs-entry';
import { deploymentRunLogsQuery } from './deployment-logs-queries';
import { DeploymentLogsStatus } from './deployment-logs-status';
import type { DeploymentRunWithDeploymentInfo } from '@automattic/api-core';

interface DeploymentLogsModalProps {
	onRequestClose: () => void;
	deployment: DeploymentRunWithDeploymentInfo;
	siteId: number;
}

export function DeploymentLogsModal( {
	onRequestClose,
	deployment,
	siteId,
}: DeploymentLogsModalProps ) {
	const locale = useLocale();

	const isDeploymentInFinalState = ( status: string ) => {
		return [ 'success', 'failed', 'warnings' ].includes( status );
	};

	const isFinalState = isDeploymentInFinalState( deployment.status );
	const {
		data: logEntries = [],
		isLoading,
		isError,
	} = useQuery( {
		...deploymentRunLogsQuery( siteId, deployment.code_deployment_id, deployment.id ),
		refetchInterval: ! isFinalState ? 1000 : undefined,
	} );

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
			<HStack spacing={ 3 } alignment="left" style={ { width: '100%', marginBottom: '16px' } }>
				{ deployment.is_active_deployment && (
					<Badge style={ { flexShrink: 0 } }>{ __( 'Active deployment' ) }</Badge>
				) }

				<div style={ { width: 'auto', flexShrink: 0, maxWidth: '33vw' } }>
					<BranchDisplay branchName={ deployment.branch_name } />
				</div>

				<HStack spacing={ 1.5 } alignment="left" style={ { width: 'auto', flexShrink: 0 } }>
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

				<DeploymentLogsStatus
					status={ deployment.status }
					startedOn={ deployment.started_on }
					completedOn={ deployment.completed_on }
				/>
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
				<VStack spacing={ 2 }>
					<div
						style={ {
							width: '752px',
							maxWidth: '100%',
							maxHeight: '216px',
							overflowY: 'auto',
							backgroundColor: 'var(--dashboard__text-color)',
							borderRadius: '4px',
						} }
					>
						<VStack
							style={ {
								width: '100%',
								padding: '16px',
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
					</div>
					<Text align="right">
						{ formatDate( new Date( deployment.created_on ), locale, {
							dateStyle: 'medium',
							timeStyle: 'long',
						} ) }
					</Text>
				</VStack>
			) }

			<HStack alignment="right" spacing={ 5 } style={ { marginTop: '24px' } }>
				<ExternalLink
					href={ `https://github.com/${ deployment.repository_name }/commit/${ deployment.metadata.commit_sha }` }
				>
					{ __( 'View deployment in Github' ) }
				</ExternalLink>
				<Button variant="primary" onClick={ onRequestClose }>
					{ __( 'Close' ) }
				</Button>
			</HStack>
		</Modal>
	);
}
