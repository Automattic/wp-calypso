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
import { useEffect } from 'react';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { MAX_SCHEDULES } from './config';
import { useCanCreateSchedules } from './hooks/use-can-create-schedules';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleForm } from './schedule-form';

interface Props {
	onNavBack?: () => void;
}
export const ScheduleCreate = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const isEligibleForFeature = useIsEligibleForFeature();
	const { onNavBack } = props;
	const { data: schedules = [], isFetched } = useUpdateScheduleQuery(
		siteSlug,
		isEligibleForFeature
	);

	const { canCreateSchedules } = useCanCreateSchedules( siteSlug, isEligibleForFeature );

	const mutationState = useMutationState( {
		filters: { mutationKey: [ 'create-update-schedule', siteSlug ] },
	} );
	const isBusy = mutationState.filter( ( { status } ) => status === 'pending' ).length > 0;

	useEffect( () => {
		if ( isFetched && schedules.length >= MAX_SCHEDULES ) {
			onNavBack && onNavBack();
		}
	}, [ isFetched ] );

	const onSyncSuccess = () => {
		recordTracksEvent( 'calypso_scheduled_updates_create_schedule', {
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
				<Text>New Schedule</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody>
				<ScheduleForm onSyncSuccess={ onSyncSuccess } />
			</CardBody>
			<CardFooter>
				<Button
					form="schedule"
					type="submit"
					variant={ canCreateSchedules ? 'primary' : 'secondary' }
					disabled={ ! canCreateSchedules }
					isBusy={ isBusy }
				>
					Create
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
