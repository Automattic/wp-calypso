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
import { useEffect } from 'react';
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { MAX_SCHEDULES } from './config';
import { ScheduleForm } from './schedule-form';

interface Props {
	onNavBack?: () => void;
}
export const ScheduleCreate = ( props: Props ) => {
	const { onNavBack } = props;
	const { data: schedules = [], isFetched } = useScheduleUpdatesQuery( siteSlug );

	const mutationState = useMutationState( {
		filters: { mutationKey: [ 'create-update-schedule', siteSlug ] },
	} );
	const isBusy = mutationState.filter( ( { status } ) => status === 'pending' ).length > 0;

	useEffect( () => {
		if ( isFetched && schedules.length >= MAX_SCHEDULES ) {
			onNavBack && onNavBack();
		}
	}, [ isFetched ] );

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
