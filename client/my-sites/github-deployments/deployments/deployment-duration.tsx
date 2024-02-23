import { useState } from 'react';
import { useInterval } from '../../../lib/interval';
import {
	DeploymentRun,
	DeploymentRunStatus,
} from '../deployment-run-logs/use-code-deployment-run-query';

function formatDuration( run: DeploymentRun ) {
	// If deployment has not yet started, we don't have a date to calculate the duration from.
	if ( ! run.started_on ) {
		return '-';
	}
	const startedOn = new Date( run.started_on ).valueOf();
	const completedOn = run.completed_on
		? new Date( run.completed_on ).valueOf()
		: new Date().valueOf();
	const totalSeconds = Math.ceil( ( completedOn - startedOn ) / 1000 );
	const minutes = Math.floor( totalSeconds / 60 );
	const seconds = totalSeconds % 60;

	return `${ minutes > 0 ? `${ minutes }m ` : '' }${ seconds }s`;
}

interface DeploymentDurationProps {
	run: DeploymentRun;
}

const IDLE_STATUSES: DeploymentRunStatus[] = [ 'dispatched', 'queued', 'building' ];

export const DeploymentDuration = ( { run }: DeploymentDurationProps ) => {
	const [ , setState ] = useState( 0 );
	const isRunCompleted = run.completed_on !== null;
	useInterval( () => setState( ( i ) => i + 1 ), isRunCompleted ? null : 1000 );

	if ( IDLE_STATUSES.includes( run.status ) ) {
		return '0s';
	}

	return <>{ formatDuration( run ) }</>;
};
