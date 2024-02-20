import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { chevronDown, chevronUp, Icon } from '@wordpress/icons';
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

interface DeploymentsListItemProps {
	run: DeploymentRun;
}

export const DeploymentsRunItem = ( { run }: DeploymentsListItemProps ) => {
	const locale = useLocale();
	const deployment = run.code_deployment as CodeDeploymentData;
	const [ expanded, setExpanded ] = useState( false );
	const icon = expanded ? chevronUp : chevronDown;

	const handleToggleExpanded = () => setExpanded( ! expanded );

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
							Starting deployment d03e94ae-adc5-41a4-bf7d-eb786c2f15b6 Downloading zipball
							https://api.github.com/repos/wptest/zipball/ae2790b4e29fed1b48ddb56ecc19eb95db8ac7f9
							Downloading zipball
							https://api.github.com/repos/wptest/zipball/ae2790b4e29fed1b48ddb56ecc19eb95db8ac7f9
							Downloading zipball
							https://api.github.com/repos/wptest/zipball/ae2790b4e29fed1b48ddb56ecc19eb95db8ac7f9
							Downloading zipball
							https://api.github.com/repos/wptest/zipball/ae2790b4e29fed1b48ddb56ecc19eb95db8ac7f9
							Zipball downloaded successfully. Extracting zipball to
							/tmp/wptest_ae2790b4e29fed1b48ddb56ecc19eb95db8ac7f9 Failed to move
							/tmp/wptest_ae2790b4e29fed1b48ddb56ecc19eb95db8ac7f9/javierarce-wptest-ae2790b Deleted
							zipball. Deployment queued.
						</pre>
					</td>
				</tr>
			) }
		</>
	);
};
