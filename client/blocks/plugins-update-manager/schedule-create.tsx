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
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-schedule-updates-query';
import { MAX_SCHEDULES } from './config';
import { ScheduleForm } from './schedule-form';

interface Props {
	onNavBack?: () => void;
}
export const ScheduleCreate = ( props: Props ) => {
	const { onNavBack } = props;
	const { data: schedules = [], isFetched } = useScheduleUpdatesQuery( siteSlug );

	const mutationState = useMutationState( {
		filters: { mutationKey: [ 'create-schedule-updates', siteSlug ] },
	} );
	const isBusy = mutationState.filter( ( { status } ) => status === 'pending' ).length > 0;

	// If the schedule is not found, navigate back to the list
	if ( isFetched && schedules.length >= MAX_SCHEDULES ) {
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
				<Text>New Schedule</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody>
				<ScheduleForm onSyncSuccess={ () => onNavBack && onNavBack() } />
			</CardBody>
			<CardFooter>
				<Button form="schedule" type="submit" variant="primary" isBusy={ isBusy }>
					Create
				</Button>
			</CardFooter>
		</Card>
	);
};
