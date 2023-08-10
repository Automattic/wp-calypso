import { Gridicon } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useDeploymentLogsURL } from './use-deployment-logs-url';

interface DeploymentStatusBadgeProps {
	status: string;
	totalFailures: number;
	connectionId: number;
	deploymentTimestamp: number;
}

export const DeploymentStatusExplanation = ( {
	status,
	totalFailures,
	connectionId,
	deploymentTimestamp,
}: DeploymentStatusBadgeProps ) => {
	const deploymentLogsUrl = useDeploymentLogsURL( {
		connectionId,
		deploymentTimestamp,
	} );

	const translate = useTranslate();

	if ( ! deploymentLogsUrl ) {
		return null;
	}

	let message;
	if ( status === 'failed' ) {
		message = translate(
			'Failed to build. Please {{a}}check the logs{{/a}} for more information.',
			{
				components: {
					a: <ExternalLink href={ deploymentLogsUrl } children={ null } />,
				},
			}
		);
	} else if ( totalFailures > 0 ) {
		message = translate(
			'Failed to transfer %(totalFailures)s file. Please {{a}}check the logs{{/a}} for more information.',
			'Failed to transfer %(totalFailures)s files. Please {{a}}check the logs{{/a}} for more information.',
			{
				count: totalFailures,
				args: {
					totalFailures,
				},
				components: {
					a: <ExternalLink href={ deploymentLogsUrl } children={ null } />,
				},
			}
		);
	}

	return (
		<div className="deployment-card__row" style={ { marginTop: '24px' } }>
			<div className="deployment-card__column" style={ { flexDirection: 'row', gap: '4px' } }>
				<Gridicon icon="notice-outline" color="red" />
				{ message }
			</div>
		</div>
	);
};
