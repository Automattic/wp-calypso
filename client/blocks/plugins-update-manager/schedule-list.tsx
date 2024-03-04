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
import { Icon, arrowLeft, info } from '@wordpress/icons';
import { useState } from 'react';
import { useDeleteScheduleUpdatesMutation } from 'calypso/data/plugins/use-schedule-updates-mutation';
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-schedule-updates-query';
import { ScheduleListCards } from './schedule-list-cards';
import { ScheduleListEmpty } from './schedule-list-empty';
import { ScheduleListTable } from './schedule-list-table';
import type { SiteSlug } from 'calypso/types';

interface Props {
	siteSlug: SiteSlug;
	onNavBack?: () => void;
	onCreateNewSchedule?: () => void;
}
export const ScheduleList = ( props: Props ) => {
	const MAX_SCHEDULES = 2;
	const isMobile = useMobileBreakpoint();

	const { siteSlug, onNavBack, onCreateNewSchedule } = props;
	const [ removeDialogOpen, setRemoveDialogOpen ] = useState( false );
	const [ selectedScheduleId, setSelectedScheduleId ] = useState< undefined | string >();

	const {
		data: schedules = [],
		isLoading,
		isFetched,
		refetch,
	} = useScheduleUpdatesQuery( siteSlug );
	const { deleteScheduleUpdates } = useDeleteScheduleUpdatesMutation( siteSlug, {
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
		selectedScheduleId && deleteScheduleUpdates( selectedScheduleId );
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
					{ isFetched && schedules.length === 0 && (
						<ScheduleListEmpty onCreateNewSchedule={ onCreateNewSchedule } />
					) }
					{ isFetched && schedules.length > 0 && (
						<>
							{ isMobile ? (
								<ScheduleListCards onRemoveClick={ () => setRemoveDialogOpen( true ) } />
							) : (
								<ScheduleListTable siteSlug={ siteSlug } onRemoveClick={ openRemoveDialog } />
							) }
						</>
					) }
					{ isFetched && schedules.length >= MAX_SCHEDULES && (
						<Text as="p">
							<Icon className="icon-info" icon={ info } size={ 16 } />
							The current feature implementation only allows to set up two schedules.
						</Text>
					) }
				</CardBody>
			</Card>
		</>
	);
};
