import { useState } from 'react';
import { useInterval } from '../../../lib/interval';
import {
	DeploymentRun,
	DeploymentRunStatus,
} from '../deployment-run-logs/use-code-deployment-run-query';

function formatDuration( run: DeploymentRun ) {
	const completedOn = run.completed_on
		? new Date( run.completed_on * 1000 ).valueOf()
		: new Date().valueOf();

	const milliseconds = completedOn - new Date( run.started_on * 1000 ).valueOf();

	const totalSeconds = milliseconds / 1000;
	const minutes = Math.floor( totalSeconds / 60 );
	const seconds = Math.ceil( totalSeconds % 60 );

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

const IDLE_STATUSES: DeploymentRunStatus[] = [ 'dispatched', 'queued', 'building' ];

export const DeploymentDuration = ( { run }: DeploymentDurationProps ) => {
	const [ , setState ] = useState( 0 );

	useInterval( () => setState( ( i ) => i + 1 ), 1000 );

	if ( IDLE_STATUSES.includes( run.status ) ) {
		return '0s';
	}

	return <>{ formatDuration( run ) }</>;
};
