export const DeployStatus = {
	STATUS_PENDING: 'pending',
	STATUS_QUEUED: 'queue',
	STATUS_RUNNING: 'running',
	STATUS_SUCCESS: 'success',
	STATUS_FAILED: 'failed',
	STATUS_BUILDING: 'building',
} as const;

type ValueOf< T > = T[ keyof T ];
export type DeploymentStatusValue = ValueOf< typeof DeployStatus >;

interface DeploymentStatusProps {
	status: DeploymentStatusValue;
}

export const DeploymentStatus = ( { status }: DeploymentStatusProps ) => {
	return (
		<div className={ `github-deployments-status github-deployments-status__${ status }` }>
			<span>{ status }</span>
		</div>
	);
};
