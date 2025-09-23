import { DeploymentRunStatus } from '@automattic/api-core';
import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, published, scheduled, error, warning, info } from '@wordpress/icons';

function formatDuration( startedOn: string, completedOn: string | number | null ) {
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

function getStatusText(
	status: DeploymentRunStatus,
	startedOn: string,
	completedOn: string | null
): string {
	const timeSinceStarted = formatDuration( startedOn, new Date().valueOf() );
	const duration = formatDuration( startedOn, completedOn );

	switch ( status ) {
		case 'dispatched':
		case 'pending':
			return __( 'Deploy pending' );
		case 'queued':
			return __( 'Deploy starting' );
		case 'building':
		case 'running':
			return sprintf(
				/* translators: %s is the duration of the deployment. e.g. 'Deploy in progress… (32s)'. */
				__( 'Deploy in progress… (%s)' ),
				timeSinceStarted
			);
		case 'success':
			return sprintf(
				/* translators: %s is the duration of the deployment. e.g. 'Deploy completed in 2min 30s'. */
				__( 'Deploy completed in %s' ),
				duration
			);
		case 'warnings':
			return __( 'Deploy warnings' );
		case 'failed':
			return __( 'Deploy unsuccessful' );
		default:
			return status;
	}
}

const getStatusIcon = (
	status: DeploymentRunStatus
): { icon: React.ReactElement; fill: string } | null => {
	switch ( status ) {
		case 'dispatched':
		case 'pending':
		case 'queued':
			return {
				icon: scheduled,
				fill: '#3b3b3b',
			};
		case 'success':
			return {
				icon: published,
				fill: 'var(--dashboard__foreground-color-success)',
			};
		case 'failed':
			return {
				icon: error,
				fill: 'var(--dashboard__foreground-color-error)',
			};
		case 'warnings':
			return {
				icon: warning,
				fill: 'var(--dashboard__foreground-color-warning)',
			};
		case 'running':
		case 'building':
			return {
				icon: info,
				fill: 'var(--dashboard__foreground-color-info)',
			};
		default:
			return null;
	}
};

interface DeploymentLogsStatusProps {
	status: DeploymentRunStatus;
	startedOn: string;
	completedOn: string | null;
}

export function DeploymentLogsStatus( {
	status,
	startedOn,
	completedOn,
}: DeploymentLogsStatusProps ) {
	const statusIcon = getStatusIcon( status );
	return (
		<HStack spacing={ 1.5 } alignment="left">
			{ statusIcon && (
				<Icon
					icon={ statusIcon.icon }
					style={ {
						flexShrink: 0,
						fill: statusIcon.fill,
					} }
				/>
			) }
			<Text size="small" style={ { color: '#3b3b3b' } }>
				{ getStatusText( status, startedOn, completedOn ) }
			</Text>
		</HStack>
	);
}
