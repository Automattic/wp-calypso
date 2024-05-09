import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { Badge } from 'calypso/blocks/plugin-scheduled-updates-common/badge';
import { useDateTimeFormat } from 'calypso/blocks/plugin-scheduled-updates-common/hooks/use-date-time-format';
import {
	MultisiteSchedulesUpdates,
	MultisiteSiteDetails,
} from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	schedule: MultisiteSchedulesUpdates;
	site?: MultisiteSiteDetails;
	onLogsClick?: ( id: string, siteSlug: string ) => void;
};

export function ScheduleListLastRunStatus( { schedule, site, onLogsClick }: Props ) {
	const translate = useTranslate();
	const { prepareDateTime } = useDateTimeFormat();

	if ( site ) {
		return (
			<>
				<Badge type={ site.last_run_status } />
				{ ( site.last_run_timestamp || site.last_run_status === 'in-progress' ) && (
					<Button
						className="schedule-last-run"
						variant="link"
						onClick={ () => onLogsClick && onLogsClick( schedule.schedule_id, site?.slug ) }
					>
						{ site.last_run_status === 'in-progress'
							? translate( 'In progress' )
							: site.last_run_timestamp && prepareDateTime( site.last_run_timestamp ) }
					</Button>
				) }
			</>
		);
	}

	const statuses = schedule.sites.map( ( site ) => site.last_run_status );
	const errorStates = [ 'failure', 'failure-and-rollback', 'failure-and-rollback-fail' ];

	const hasRun = statuses.some( ( status ) => status !== null );
	const isInProgress = statuses.some( ( status ) => status === 'in-progress' );
	const isSuccess = statuses.every( ( status ) => status === 'success' || ! status );
	const isFailure = statuses.some( ( status ) => status && errorStates.includes( status ) );
	const failureCount = statuses.filter(
		( status ) => status && errorStates.includes( status )
	).length;

	if ( ! hasRun ) {
		return null;
	}

	if ( isInProgress ) {
		return (
			<>
				<Badge type="in-progress" />
				{ translate( 'In progress' ) }
			</>
		);
	}

	if ( isSuccess ) {
		return (
			<>
				<Badge type="success" />
				{ translate( 'All sites updated' ) }
			</>
		);
	}
	if ( isFailure ) {
		return (
			<>
				<Badge type="failure" />
				{ translate( 'Errors on %d sites', { args: [ failureCount ] } ) }
			</>
		);
	}
}
