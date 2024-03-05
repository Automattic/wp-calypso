import {
	__experimentalText as Text,
	Button,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-schedule-updates-query';
import { SiteSlug } from 'calypso/types';
import { ScheduleForm } from './schedule-form';

interface Props {
	siteSlug: SiteSlug;
	scheduleId?: string;
	onNavBack?: () => void;
}
export const ScheduleEdit = ( props: Props ) => {
	const { siteSlug, scheduleId, onNavBack } = props;
	const { data: schedules = [], isFetched } = useScheduleUpdatesQuery( siteSlug );
	const schedule = schedules.find( ( s ) => s.id === scheduleId );

	// If the schedule is not found, navigate back to the list
	if ( isFetched && ! schedule ) {
		onNavBack && onNavBack();
		return null;
	}

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<div className="ch-placeholder">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							Back
						</Button>
					) }
				</div>
				<Text>Edit Schedule</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody>
				{ schedule && (
					<ScheduleForm
						siteSlug={ siteSlug }
						scheduleForEdit={ schedule }
						onCreateSuccess={ () => onNavBack && onNavBack() }
					/>
				) }
			</CardBody>
			<CardFooter>
				<Button form="schedule" type="submit" variant="primary">
					Edit
				</Button>
			</CardFooter>
		</Card>
	);
};
