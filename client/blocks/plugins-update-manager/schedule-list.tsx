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
import { Icon, arrowLeft, info, warning } from '@wordpress/icons';
import { useState } from 'react';
import { useDeleteUpdateScheduleMutation } from 'calypso/data/plugins/use-update-schedules-mutation';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { MAX_SCHEDULES } from './config';
import { useSiteSlug } from './hooks/use-site-slug';
import { ScheduleListCards } from './schedule-list-cards';
import { ScheduleListEmpty } from './schedule-list-empty';
import { ScheduleListTable } from './schedule-list-table';

interface Props {
	onNavBack?: () => void;
	canCreateSchedules: boolean;
	onCreateNewSchedule?: () => void;
	onEditSchedule: ( id: string ) => void;
}
export const ScheduleList = ( props: Props ) => {
	const siteSlug = useSiteSlug();
	const isMobile = useMobileBreakpoint();

	const { onNavBack, onCreateNewSchedule, onEditSchedule, canCreateSchedules } = props;
	const [ removeDialogOpen, setRemoveDialogOpen ] = useState( false );
	const [ selectedScheduleId, setSelectedScheduleId ] = useState< undefined | string >();

	const {
		data: schedules = [],
		isLoading,
		isFetched,
		refetch,
	} = useUpdateScheduleQuery( siteSlug );
	const { deleteUpdateSchedule } = useDeleteUpdateScheduleMutation( siteSlug, {
		onSuccess: () => refetch(),
	} );

	const openRemoveDialog = ( id: string ) => {
		setRemoveDialogOpen( true );
		setSelectedScheduleId( id );
	};

	const closeRemoveConfirm = () => {
		setRemoveDialogOpen( false );
		setSelectedScheduleId( undefined );
	};

	const onRemoveDialogConfirm = () => {
		selectedScheduleId && deleteUpdateSchedule( selectedScheduleId );
		closeRemoveConfirm();
	};

	return (
		<>
			<ConfirmDialog
				isOpen={ removeDialogOpen }
				onConfirm={ onRemoveDialogConfirm }
				onCancel={ closeRemoveConfirm }
			>
				Are you sure you want to delete this schedule?
			</ConfirmDialog>
			<Card className="plugins-update-manager">
				<CardHeader size="extraSmall">
					<div className="ch-placeholder">
						{ onNavBack && (
							<Button icon={ arrowLeft } onClick={ onNavBack }>
								Back
							</Button>
						) }
					</div>
					<Text>Schedules</Text>
					<div className="ch-placeholder"></div>
				</CardHeader>
				<CardBody>
					{ isLoading && <Spinner /> }
					{ isFetched && ( schedules.length === 0 || ! canCreateSchedules ) && (
						<ScheduleListEmpty
							onCreateNewSchedule={ onCreateNewSchedule }
							canCreateSchedules={ canCreateSchedules }
						/>
					) }
					{ isFetched && schedules.length > 0 && canCreateSchedules && (
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
					{ isFetched && schedules.length >= MAX_SCHEDULES && canCreateSchedules && (
						<Text as="p">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							The current feature implementation only allows to set up two schedules.
						</Text>
					) }
					{ isFetched && ! canCreateSchedules && (
						<Text as="p">
							<Icon className="icon-warning" icon={ warning } size={ 16 } />
							This site is unable to schedule auto-updates for plugins.
						</Text>
					) }
				</CardBody>
			</Card>
		</>
	);
};
