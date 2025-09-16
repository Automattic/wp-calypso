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
import { __, sprintf } from '@wordpress/i18n';
import { Icon, published } from '@wordpress/icons';
import { useLocale } from '../../../app/locale';
import { formatDate } from '../../../utils/datetime';
import { BranchDisplay } from '../branch-display';
import { DeploymentLogsEntry } from './deployment-logs-entry';
import { deploymentRunLogsQuery } from './deployment-logs-queries';
import type { DeploymentRunWithDeploymentInfo } from '@automattic/api-core';

interface DeploymentLogsModalProps {
	isOpen: boolean;
	onRequestClose: () => void;
	deployment: DeploymentRunWithDeploymentInfo;
	siteId: number;
}

function formatDuration( startedOn: string, completedOn: string ) {
	if ( ! startedOn ) {
		return '-';
	}
	const startedOnDate = new Date( startedOn ).valueOf();
	const completedOnDate = completedOn ? new Date( completedOn ).valueOf() : new Date().valueOf();
	const totalSeconds = Math.ceil( ( completedOnDate - startedOnDate ) / 1000 );
	const minutes = Math.floor( totalSeconds / 60 );
	const seconds = totalSeconds % 60;

	return `${ minutes > 0 ? `${ minutes }m ` : '' }${ seconds }s`;
}

export function DeploymentLogsModal( {
	isOpen,
	onRequestClose,
	deployment,
	siteId,
}: DeploymentLogsModalProps ) {
	const locale = useLocale();
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

				{ deployment.status === 'success' && (
					<HStack spacing={ 1.5 } alignment="left">
						<Icon
							icon={ published }
							style={ {
								flexShrink: 0,
								fill: 'var(--dashboard__foreground-color-success)',
							} }
						/>
						<Text size="small" style={ { color: '#3b3b3b' } }>
							{ sprintf(
								// translators: %s is the duration of the deployment. e.g. 'Deploy completed in 2min 30s'.
								__( 'Deploy completed in %s' ),
								formatDuration( deployment.started_on, deployment.completed_on )
							) }
						</Text>
					</HStack>
				) }
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
