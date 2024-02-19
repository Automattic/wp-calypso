import { __ } from '@wordpress/i18n';

export const DeployStatus = {
	STATUS_PENDING: 0,
	STATUS_QUEUED: 1,
	STATUS_RUNNING: 2,
	STATUS_SUCCESS: 3,
	STATUS_FAILED: 4,
	STATUS_BUILDING: 5,
} as const;

type ValueOf< T > = T[ keyof T ];

interface DeploymentStatusProps {
	status: ValueOf< typeof DeployStatus >;
}

const getStatusText = ( status: ValueOf< typeof DeployStatus > ) => {
	switch ( status ) {
		case DeployStatus.STATUS_PENDING:
			return __( 'Pending' );
		case DeployStatus.STATUS_QUEUED:
			return __( 'Queued' );
		case DeployStatus.STATUS_RUNNING:
			return __( 'Running' );
		case DeployStatus.STATUS_SUCCESS:
			return __( 'Success' );
		case DeployStatus.STATUS_FAILED:
			return __( 'Failed' );
		case DeployStatus.STATUS_BUILDING:
			return __( 'Building' );
		default:
			return __( 'Unknown' );
	}
};

const getClassname = ( status: ValueOf< typeof DeployStatus > ) => {
	switch ( status ) {
		case DeployStatus.STATUS_PENDING:
			return 'pending';
		case DeployStatus.STATUS_QUEUED:
			return 'queued';
		case DeployStatus.STATUS_RUNNING:
			return 'running';
		case DeployStatus.STATUS_SUCCESS:
			return 'success';
		case DeployStatus.STATUS_FAILED:
			return 'failed';
		case DeployStatus.STATUS_BUILDING:
			return 'building';
		default:
			return '';
	}
};

export const DeploymentStatus = ( { status }: DeploymentStatusProps ) => {
	return (
		<div
			className={ `github-deployments-status github-deployments-status__${ getClassname(
				status
			) }` }
		>
			<span>{ getStatusText( status ) }</span>
		</div>
	);
};
