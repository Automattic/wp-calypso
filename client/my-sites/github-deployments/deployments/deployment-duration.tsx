import { DeploymentRun } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';

function formatDuration( run: DeploymentRun ) {
	if ( ! run.completed_on ) {
		return null;
	}
	const milliseconds = Date.parse( run.completed_on ) - Date.parse( run.started_on );

	const totalSeconds = milliseconds / 1000;
	const minutes = Math.floor( totalSeconds / 60 );
	const seconds = totalSeconds % 60;

	if ( minutes > 0 ) {
		if ( seconds > 0 ) {
			return `${ minutes }m ${ seconds }s`;
		}
		return `${ minutes }m`;
	}
	return `${ seconds }s`;
}

interface DeploymentDurationProps {
	run: DeploymentRun;
}

export const DeploymentDuration = ( { run }: DeploymentDurationProps ) => {
	return <>{ formatDuration( run ) }</>;
};
