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

interface DeploymentStatusProps {
	status: DeploymentStatusValue;
}

function getText( status: DeploymentStatusValue ) {
	switch ( status ) {
		case 'pending':
			return __( 'Pending' );
		case 'queued':
			return __( 'Queued' );
		case 'running':
			return __( 'Running' );
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

export const DeploymentStatus = ( { status }: DeploymentStatusProps ) => {
	return (
		<div className={ `github-deployments-status github-deployments-status__${ status }` }>
			<span>{ getText( status ) }</span>
		</div>
	);
};
