import { useMutationState } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	Button,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleForm } from './schedule-form';

interface Props {
	scheduleId?: string;
	onNavBack?: () => void;
}
export const ScheduleEdit = ( props: Props ) => {
	const siteSlug = useSiteSlug();

	const { scheduleId, onNavBack } = props;
	const { data: schedules = [], isFetched } = useScheduleUpdatesQuery( siteSlug );
	const schedule = schedules.find( ( s ) => s.id === scheduleId );

	const mutationState = useMutationState( {
		filters: { mutationKey: [ 'edit-update-schedule', siteSlug ] },
	} );
	const isBusy = mutationState.filter( ( { status } ) => status === 'pending' ).length > 0;

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
						scheduleForEdit={ schedule }
						onSyncSuccess={ () => onNavBack && onNavBack() }
					/>
				) }
			</CardBody>
			<CardFooter>
				<Button form="schedule" type="submit" variant="primary" isBusy={ isBusy }>
					Save
				</Button>
			</CardFooter>
		</Card>
	);
};
