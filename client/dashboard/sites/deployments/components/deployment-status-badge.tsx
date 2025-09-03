import { Badge } from '@automattic/ui';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const DeployStatus = {
	STATUS_PENDING: 'pending',
	STATUS_QUEUED: 'queued',
	STATUS_RUNNING: 'running',
	STATUS_SUCCESS: 'success',
	STATUS_FAILED: 'failed',
	STATUS_WARNINGS: 'warnings',
	STATUS_BUILDING: 'building',
} as const;

type ValueOf< T > = T[ keyof T ];
export type DeploymentStatusValue = ValueOf< typeof DeployStatus >;

interface DeploymentStatusBadgeProps {
	status: DeploymentStatusValue;
}

function getStatusText( status: DeploymentStatusValue ) {
	switch ( status ) {
		case 'pending':
			return __( 'Pending' );
		case 'queued':
			return __( 'Queued' );
		case 'running':
			return __( 'Deploying' );
		case 'success':
			return __( 'Deployed' );
		case 'warnings':
			return __( 'Warnings' );
		case 'failed':
			return __( 'Error' );
		default:
			return status;
	}
}

function getStatusIntent( status: DeploymentStatusValue ) {
	switch ( status ) {
		case 'success':
			return 'success';
		case 'failed':
			return 'error';
		case 'warnings':
			return 'warning';
		case 'running':
		case 'building':
			return 'info';
		default:
			return 'default';
	}
}

export function DeploymentStatusBadge( { status }: DeploymentStatusBadgeProps ) {
	if ( status === 'queued' ) {
		return <Text variant="muted">{ getStatusText( status ) }</Text>;
	}
	return <Badge intent={ getStatusIntent( status ) }>{ getStatusText( status ) }</Badge>;
}
