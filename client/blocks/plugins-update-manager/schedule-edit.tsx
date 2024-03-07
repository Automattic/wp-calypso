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
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleForm } from './schedule-form';

interface Props {
	scheduleId?: string;
	onNavBack?: () => void;
}
export const ScheduleEdit = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const isEligibleForFeature = useIsEligibleForFeature();
	const { scheduleId, onNavBack } = props;
	const { data: schedules = [], isFetched } = useUpdateScheduleQuery(
		siteSlug,
		isEligibleForFeature
	);
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
