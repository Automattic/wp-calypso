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
import { arrowLeft, info } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { MAX_SCHEDULES } from './config';
import { useCanCreateSchedules } from './hooks/use-can-create-schedules';
import { useCreateMonitor } from './hooks/use-create-monitor';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleForm } from './schedule-form';

interface Props {
	onNavBack?: () => void;
}
export const ScheduleCreate = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const { createMonitor } = useCreateMonitor( siteSlug );
	const isEligibleForFeature = useIsEligibleForFeature();
	const { onNavBack } = props;
	const { data: schedules = [], isFetched } = useUpdateScheduleQuery(
		siteSlug,
		isEligibleForFeature
	);
	const { canCreateSchedules, errors: eligibilityCheckErrors } = useCanCreateSchedules(
		siteSlug,
		isEligibleForFeature
	);

	const pendingMutations = useMutationState( {
		filters: { mutationKey: [ 'edit-update-schedule', siteSlug ], status: 'pending' },
	} );
	const isBusy = pendingMutations.length > 0;
	const [ syncError, setSyncError ] = useState( '' );

	useEffect( () => {
		if ( isFetched && schedules.length >= MAX_SCHEDULES ) {
			onNavBack && onNavBack();
		}
	}, [ isFetched ] );

	const onSyncSuccess = () => {
		recordTracksEvent( 'calypso_scheduled_updates_create_schedule', {
			site_slug: siteSlug,
		} );

		createMonitor();
		setSyncError( '' );

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
				<ScheduleForm onSyncSuccess={ onSyncSuccess } onSyncError={ setSyncError } />
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
				{ ( ( ! canCreateSchedules && eligibilityCheckErrors?.length ) || syncError ) && (
					<Text as="p" className="validation-msg">
						<Icon className="icon-info" icon={ info } size={ 16 } />
						{ ( eligibilityCheckErrors?.length && eligibilityCheckErrors[ 0 ].message ) || '' }
						{ syncError }
					</Text>
				) }
			</CardFooter>
		</Card>
	);
};
