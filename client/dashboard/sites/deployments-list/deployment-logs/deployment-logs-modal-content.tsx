import { deploymentRunLogsQuery } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Spinner,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useLocale } from '../../../app/locale';
import { formatDate } from '../../../utils/datetime';
import { BranchDisplay } from '../branch-display';
import { DeploymentLogsEntry } from './deployment-logs-entry';
import { DeploymentLogsStatus } from './deployment-logs-status';
import type { DeploymentRunWithDeploymentInfo } from '@automattic/api-core';

interface DeploymentLogsModalContentProps {
	onRequestClose: () => void;
	deployment: DeploymentRunWithDeploymentInfo;
	siteId: number;
}

export function DeploymentLogsModalContent( {
	onRequestClose,
	deployment,
	siteId,
}: DeploymentLogsModalContentProps ) {
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
	const [ , repositoryName ] = deployment.repository_name.split( '/' );
	return (
		<VStack spacing={ 4 }>
			<VStack spacing={ 1 }>
				<Heading upperCase size={ 11 } weight={ 500 } style={ { color: '#757575' } }>
					{ repositoryName }
				</Heading>

				<Text size={ 15 } truncate numberOfLines={ 1 } weight={ 500 }>
					{ commit_message }
				</Text>

				<HStack spacing={ 3 } alignment="left">
					{ deployment.is_active_deployment && (
						<Badge style={ { flexShrink: 0 } }>{ __( 'Active deployment' ) }</Badge>
					) }

					<ExternalLink
						style={ { flexShrink: 0 } }
						href={ `https://github.com/${ deployment.repository_name }/commit/${ commit_sha }` }
					>
						<Text
							as="code"
							size="small"
							style={ { color: 'var(--wp-admin-theme-color-darker-20)' } }
						>
							{ shortSha }
						</Text>
					</ExternalLink>

					<div style={ { width: 'auto', flexShrink: 0, maxWidth: '50%' } }>
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
			</VStack>

			{ isError && <Text>{ __( 'Failed to load deployment logs. Please try again.' ) }</Text> }
			{ ! isLoading && isDeploymentInFinalState( deployment.status ) && logEntries.length === 0 && (
				<Text>{ __( 'No logs available for this deployment.' ) }</Text>
			) }

			{ isLoading && (
				<HStack alignment="center">
					<Spinner />
				</HStack>
			) }

			<VStack spacing={ 6 }>
				{ ! isLoading &&
					( logEntries.length > 0 || ! isDeploymentInFinalState( deployment.status ) ) && (
						<VStack spacing={ 2 }>
							<div
								style={ {
									maxHeight: '15lh',
									overflowY: 'scroll',
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

				<HStack alignment="right" spacing={ 5 }>
					{ deployment.metadata.workflow_run_id && (
						<ExternalLink
							href={ `https://github.com/${ deployment.repository_name }/actions/runs/${ deployment.metadata.workflow_run_id }` }
						>
							{ __( 'View workflow run in GitHub' ) }
						</ExternalLink>
					) }
					<Button variant="primary" onClick={ onRequestClose }>
						{ __( 'Close' ) }
					</Button>
				</HStack>
			</VStack>
		</VStack>
	);
}
