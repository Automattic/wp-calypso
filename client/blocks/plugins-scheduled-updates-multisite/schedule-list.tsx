import { useMobileBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Spinner,
} from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useBatchDeleteUpdateScheduleMutation } from 'calypso/data/plugins/use-update-schedules-mutation';
import { useMultisiteUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ScheduleListTable } from './schedule-list-table';

type Props = {
	onEditSchedule: ( id: string ) => void;
	onShowLogs: ( id: string, siteSlug: string ) => void;
	onCreateNewSchedule: () => void;
};

export const ScheduleList = ( props: Props ) => {
	const { onEditSchedule, onShowLogs, onCreateNewSchedule } = props;
	const {
		data: schedules = [],
		isLoading: isLoadingSchedules,
		isFetched,
	} = useMultisiteUpdateScheduleQuery( true );
	const isMobile = useMobileBreakpoint();
	const translate = useTranslate();
	const [ search ] = useState( '' );
	const [ removeDialogOpen, setRemoveDialogOpen ] = useState( false );
	const [ selectedScheduleId, setSelectedScheduleId ] = useState< string | undefined >();
	const [ selectedSiteSlugs, setSelectedSiteSlugs ] = useState< string[] >( [] );

	useEffect( () => {
		const schedule = schedules?.find( ( schedule ) => schedule.schedule_id === selectedScheduleId );
		setSelectedSiteSlugs( schedule?.sites?.map( ( site ) => site.slug ) || [] );
	}, [ selectedScheduleId ] );

	const deleteUpdateSchedules = useBatchDeleteUpdateScheduleMutation( selectedSiteSlugs );

	const openRemoveDialog = ( id: string ) => {
		setRemoveDialogOpen( true );
		setSelectedScheduleId( id );
	};

	const closeRemoveConfirm = () => {
		setRemoveDialogOpen( false );
		setSelectedScheduleId( undefined );
	};

	const onRemoveDialogConfirm = () => {
		if ( selectedSiteSlugs && selectedScheduleId ) {
			deleteUpdateSchedules.mutate( selectedScheduleId );
			recordTracksEvent( 'calypso_scheduled_updates_multisite_delete_schedule', {
				site_slugs: selectedSiteSlugs.join( ',' ),
			} );
		}
		closeRemoveConfirm();
	};

	const filteredSchedules = schedules?.filter( ( schedule ) => {
		if ( ! search || ! search.length ) {
			return true;
		}

		return (
			schedule.sites.filter( ( site ) => site.title.toLowerCase().includes( search.toLowerCase() ) )
				.length > 0
		);
	} );
	const isLoading = isLoadingSchedules;
	const ScheduleListComponent = isMobile ? null : ScheduleListTable;

	return (
		<div className="plugins-update-manager plugins-update-manager-multisite">
			<h1 className="wp-brand-font">List schedules</h1>
			<Button
				__next40pxDefaultSize
				icon={ plus }
				variant="primary"
				onClick={ onCreateNewSchedule }
				disabled={ false }
			>
				{ translate( 'Add new schedule' ) }
			</Button>

			{ schedules.length === 0 && isLoading && <Spinner /> }

			{ isFetched && filteredSchedules && ScheduleListComponent ? (
				<ScheduleListComponent
					schedules={ filteredSchedules }
					onRemoveClick={ openRemoveDialog }
					onEditClick={ onEditSchedule }
					onLogsClick={ onShowLogs }
				/>
			) : null }
			<ConfirmDialog
				isOpen={ removeDialogOpen }
				onConfirm={ onRemoveDialogConfirm }
				onCancel={ closeRemoveConfirm }
			>
				{ translate( 'Are you sure you want to delete this schedule?' ) }
			</ConfirmDialog>
		</div>
	);
};
