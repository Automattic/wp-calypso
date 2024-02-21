import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { Spinner } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { chevronDown, chevronUp, Icon } from '@wordpress/icons';
import { useCodeDeploymentsRunLogQuery } from 'calypso/my-sites/github-deployments/deployment-run-logs/use-code-deployment-run-log-query';
import { DeploymentCommitDetails } from 'calypso/my-sites/github-deployments/deployments/deployment-commit-details';
import { DeploymentDuration } from 'calypso/my-sites/github-deployments/deployments/deployment-duration';
import {
	DeploymentStatus,
	DeploymentStatusValue,
} from 'calypso/my-sites/github-deployments/deployments/deployment-status';
import {
	CodeDeploymentData,
	DeploymentRun,
} from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';
import { formatDate } from 'calypso/my-sites/github-deployments/utils/dates';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';

interface DeploymentsListItemProps {
	run: DeploymentRun;
}

export const DeploymentsRunItem = ( { run }: DeploymentsListItemProps ) => {
	const locale = useLocale();
	const siteId = useSelector( getSelectedSiteId );
	const deployment = run.code_deployment as CodeDeploymentData;
	const [ expanded, setExpanded ] = useState( false );
	const icon = expanded ? chevronUp : chevronDown;
	const { data: logEntries = [], isLoading: isFetchingLogs } = useCodeDeploymentsRunLogQuery(
		siteId,
		deployment.id,
		run.id,
		{ enabled: expanded }
	);

	const handleToggleExpanded = () => setExpanded( ! expanded );

	const noLogsAvailable = expanded && ! isFetchingLogs && logEntries.length === 0;

	return (
		<>
			<tr data-expanded={ expanded }>
				<td>
					<DeploymentCommitDetails run={ run } deployment={ deployment } />
				</td>
				<td>
					<DeploymentStatus status={ run.status as DeploymentStatusValue } />
				</td>
				<td>
					<span>{ formatDate( locale, new Date( deployment.updated_on ) ) }</span>
				</td>
				<td>
					<DeploymentDuration run={ run } />
				</td>
				<td>
					<Button plain onClick={ handleToggleExpanded }>
						<Icon icon={ icon } size={ 24 } />
					</Button>
				</td>
			</tr>
			{ expanded && (
				<tr>
					<td className="github-deployments-logs-content" colSpan={ 5 }>
						<pre>
							{ isFetchingLogs && (
								<div className="github-deployments-logs__loading">
									<Spinner />
								</div>
							) }

							{ logEntries.map( ( entry, id ) => (
								<div key={ id }>
									{ entry.timestamp } { entry.level.toUpperCase() } { entry.message }
								</div>
							) ) }

							{ noLogsAvailable && (
								<p className="github-deployments-logs-no-content">
									No logs available for this deployment run.
								</p>
							) }
						</pre>
					</td>
				</tr>
			) }
		</>
	);
};
