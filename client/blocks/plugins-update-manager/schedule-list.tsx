import { useMobileBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalText as Text,
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Card,
	CardBody,
	CardHeader,
	Spinner,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDeleteUpdateScheduleMutation } from 'calypso/data/plugins/use-update-schedules-mutation';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useCanCreateSchedules } from './hooks/use-can-create-schedules';
import { useIsEligibleForFeature } from './hooks/use-is-eligible-for-feature';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleListCards } from './schedule-list-cards';
import { ScheduleListEmpty } from './schedule-list-empty';
import { ScheduleListTable } from './schedule-list-table';

interface Props {
	onNavBack?: () => void;
	onCreateNewSchedule?: () => void;
	onEditSchedule: ( id: string ) => void;
}
export const ScheduleList = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();
	const { isEligibleForFeature, loading: isEligibleForFeatureLoading } = useIsEligibleForFeature();

	const { onNavBack, onCreateNewSchedule, onEditSchedule } = props;
	const [ removeDialogOpen, setRemoveDialogOpen ] = useState( false );
	const [ selectedScheduleId, setSelectedScheduleId ] = useState< undefined | string >();

	const {
		data: schedules = [],
		isLoading,
		isFetched,
		refetch,
	} = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );

	const { deleteUpdateSchedule } = useDeleteUpdateScheduleMutation( siteSlug, {
		onSuccess: () => refetch(),
	} );

	const { canCreateSchedules, isLoading: isLoadingCanCreateSchedules } = useCanCreateSchedules(
		siteSlug,
		isEligibleForFeature
	);

	const showScheduleListEmpty =
		( ! isEligibleForFeature && ! isEligibleForFeatureLoading ) ||
		( isFetched &&
			! isLoadingCanCreateSchedules &&
			( schedules.length === 0 || ! canCreateSchedules ) );

	const openRemoveDialog = ( id: string ) => {
		setRemoveDialogOpen( true );
		setSelectedScheduleId( id );
	};

	const closeRemoveConfirm = () => {
		setRemoveDialogOpen( false );
		setSelectedScheduleId( undefined );
	};

	const onRemoveDialogConfirm = () => {
		if ( selectedScheduleId ) {
			deleteUpdateSchedule( selectedScheduleId );
			recordTracksEvent( 'calypso_scheduled_updates_delete_schedule', {
				site_slug: siteSlug,
			} );
		}
		closeRemoveConfirm();
	};

	return (
		<>
			<ConfirmDialog
				isOpen={ removeDialogOpen }
				onConfirm={ onRemoveDialogConfirm }
				onCancel={ closeRemoveConfirm }
			>
				{ translate( 'Are you sure you want to delete this schedule?' ) }
			</ConfirmDialog>
			<Card className="plugins-update-manager">
				<CardHeader size="extraSmall">
					<div className="ch-placeholder">
						{ onNavBack && (
							<Button icon={ arrowLeft } onClick={ onNavBack }>
								{ translate( 'Back' ) }
							</Button>
						) }
					</div>
					<Text>{ translate( 'Schedules' ) }</Text>
					<div className="ch-placeholder"></div>
				</CardHeader>
				<CardBody>
					{ ( isLoading || isLoadingCanCreateSchedules || isEligibleForFeatureLoading ) && (
						<Spinner />
					) }
					{ showScheduleListEmpty && (
						<ScheduleListEmpty
							onCreateNewSchedule={ onCreateNewSchedule }
							canCreateSchedules={ canCreateSchedules }
						/>
					) }
					{ isFetched &&
						! isLoadingCanCreateSchedules &&
						schedules.length > 0 &&
						canCreateSchedules && (
							<>
								{ isMobile ? (
									<ScheduleListCards
										onRemoveClick={ openRemoveDialog }
										onEditClick={ onEditSchedule }
									/>
								) : (
									<ScheduleListTable
										onRemoveClick={ openRemoveDialog }
										onEditClick={ onEditSchedule }
									/>
								) }
							</>
						) }
				</CardBody>
			</Card>
		</>
	);
};
