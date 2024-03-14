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
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
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
	const translate = useTranslate();

	const { scheduleId, onNavBack } = props;
	const { isEligibleForFeature } = useIsEligibleForFeature();
	const { data: schedules = [], isFetched } = useUpdateScheduleQuery(
		siteSlug,
		isEligibleForFeature
	);
	const schedule = schedules.find( ( s ) => s.id === scheduleId );

	const pendingMutations = useMutationState( {
		filters: { mutationKey: [ 'edit-update-schedule', siteSlug ], status: 'pending' },
	} );
	const isBusy = pendingMutations.length > 0;
	const [ syncError, setSyncError ] = useState( '' );

	const { canCreateSchedules, errors: eligibilityCheckErrors } = useCanCreateSchedules(
		siteSlug,
		isEligibleForFeature
	);

	// If the schedule is not found, navigate back to the list
	if ( isFetched && ! schedule ) {
		onNavBack && onNavBack();
		return null;
	}

	const onSyncSuccess = () => {
		recordTracksEvent( 'calypso_scheduled_updates_edit_schedule', {
			site_slug: siteSlug,
		} );

		setSyncError( '' );

		return onNavBack && onNavBack();
	};

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<div className="ch-placeholder">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							{ translate( 'Back' ) }
						</Button>
					) }
				</div>
				<Text>{ translate( 'Edit Schedule' ) }</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody>
				{ schedule && (
					<ScheduleForm
						scheduleForEdit={ schedule }
						onSyncSuccess={ onSyncSuccess }
						onSyncError={ setSyncError }
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
					{ translate( 'Save' ) }
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
