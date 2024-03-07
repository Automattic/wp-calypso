import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useMutationState } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	Button,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Icon,
} from '@wordpress/components';
import { arrowLeft, warning } from '@wordpress/icons';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { useCanCreateSchedules } from './hooks/use-can-create-schedules';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleForm } from './schedule-form';

interface Props {
	scheduleId?: string;
	onNavBack?: () => void;
}
export const ScheduleEdit = ( props: Props ) => {
	const siteSlug = useSiteSlug();

	const { scheduleId, onNavBack } = props;
	const { data: schedules = [], isFetched } = useUpdateScheduleQuery( siteSlug );
	const schedule = schedules.find( ( s ) => s.id === scheduleId );

	const mutationState = useMutationState( {
		filters: { mutationKey: [ 'edit-update-schedule', siteSlug ] },
	} );
	const isBusy = mutationState.filter( ( { status } ) => status === 'pending' ).length > 0;

	const { canCreateSchedules } = useCanCreateSchedules( siteSlug );

	// If the schedule is not found, navigate back to the list
	if ( isFetched && ! schedule ) {
		onNavBack && onNavBack();
		return null;
	}

	const onSyncSuccess = () => {
		recordTracksEvent( 'calypso_update_manager_schedule_edit', {
			site_slug: siteSlug,
		} );

		return onNavBack && onNavBack();
	};

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
					<ScheduleForm scheduleForEdit={ schedule } onSyncSuccess={ onSyncSuccess } />
				) }
			</CardBody>
			<CardFooter>
				<Button
					form="schedule"
					type="submit"
					variant={ canCreateSchedules ? 'primary' : 'secondary' }
					isBusy={ isBusy }
					disabled={ ! canCreateSchedules }
				>
					Save
				</Button>
				{ ! canCreateSchedules && (
					<Text as="p">
						<Icon className="icon-info" icon={ warning } size={ 16 } />
						This site is unable to schedule auto-updates for plugins.
					</Text>
				) }
			</CardFooter>
		</Card>
	);
};
