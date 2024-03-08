/* eslint-disable no-nested-ternary */
import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp, Icon } from '@wordpress/icons';
import { GitHubLoadingPlaceholder } from 'calypso/my-sites/github-deployments/components/loading-placeholder/index';
import { DeploymentAuthor } from 'calypso/my-sites/github-deployments/deployment-run-logs/deployment-author';
import { useCodeDeploymentsRunLogQuery } from 'calypso/my-sites/github-deployments/deployment-run-logs/use-code-deployment-run-log-query';
import { DeploymentCommitDetails } from 'calypso/my-sites/github-deployments/deployments/deployment-commit-details';
import { DeploymentDuration } from 'calypso/my-sites/github-deployments/deployments/deployment-duration';
import {
	DeploymentStatus,
	DeploymentStatusValue,
} from 'calypso/my-sites/github-deployments/deployments/deployment-status';
import { formatDate } from 'calypso/my-sites/github-deployments/utils/dates';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import { DeploymentRunLogs } from './deployment-run-logs';
import { DeploymentRun } from './use-code-deployment-run-query';

interface DeploymentsListItemProps {
	run: DeploymentRun;
}

export const DeploymentsRunItem = ( { run }: DeploymentsListItemProps ) => {
	const locale = useLocale();
	const siteId = useSelector( getSelectedSiteId );
	const deployment = run.code_deployment!;
	const [ expanded, setExpanded ] = useState( false );
	const icon = expanded ? chevronUp : chevronDown;
	const { data: logEntries = [], isLoading: isFetchingLogs } = useCodeDeploymentsRunLogQuery(
		siteId,
		deployment.id,
		run.id,
		{
			enabled: expanded,
			refetchInterval: 5000,
		}
	);
	const { author } = run.metadata;

	const handleToggleExpanded = () => setExpanded( ! expanded );

	return (
		<>
			<tr
				data-expanded={ expanded }
				onClick={ handleToggleExpanded }
				className="github-deployments-run-item"
			>
				<td>
					{ author && <DeploymentAuthor name={ author.name } avatarUrl={ author.avatar_url } /> }
				</td>
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
					<td className="github-deployments-logs-content" colSpan={ 6 }>
						{ isFetchingLogs ? (
							<pre>
								<GitHubLoadingPlaceholder />
							</pre>
						) : logEntries.length === 0 ? (
							<p>{ __( 'No logs available for this deployment run.' ) }</p>
						) : (
							<DeploymentRunLogs logEntries={ logEntries } />
						) }
					</td>
				</tr>
			) }
		</>
	);
};
