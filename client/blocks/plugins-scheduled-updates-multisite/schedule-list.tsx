import {
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Spinner,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState } from 'react';
import { MultisitePluginUpdateManagerContext } from 'calypso/blocks/plugins-scheduled-updates-multisite/context';
import { useBatchDeleteUpdateScheduleMutation } from 'calypso/data/plugins/use-update-schedules-mutation';
import { useMultisiteUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ScheduleErrors } from './schedule-errors';
import { ScheduleListCardNew } from './schedule-list-card-new';
import { ScheduleListCards } from './schedule-list-cards';
import { ScheduleListEmpty } from './schedule-list-empty';
import { ScheduleListFilter } from './schedule-list-filter';
import { ScheduleListTable } from './schedule-list-table';

import './styles.scss';

type Props = {
	compact?: boolean;
	previewMode: 'table' | 'card';
	showNewScheduleBtn?: boolean;
	selectedScheduleId?: string;
	onEditSchedule: ( id: string ) => void;
	onShowLogs: ( id: string, siteSlug: string ) => void;
	onCreateNewSchedule: () => void;
};

export const ScheduleList = ( props: Props ) => {
	const {
		compact,
		previewMode,
		showNewScheduleBtn = true,
		selectedScheduleId: initSelectedScheduleId,
		onEditSchedule,
		onShowLogs,
		onCreateNewSchedule,
	} = props;
	const {
		data: schedules = [],
		isLoading: isLoadingSchedules,
		isFetched,
		refetch,
	} = useMultisiteUpdateScheduleQuery( true );
	const translate = useTranslate();
	const { searchTerm } = useContext( MultisitePluginUpdateManagerContext );
	const [ removeDialogOpen, setRemoveDialogOpen ] = useState( false );
	const [ selectedScheduleId, setSelectedScheduleId ] = useState< string | undefined >(
		initSelectedScheduleId
	);
	const [ selectedSiteSlugs, setSelectedSiteSlugs ] = useState< string[] >( [] );

	useEffect( () => {
		const schedule = schedules?.find( ( schedule ) => schedule.schedule_id === selectedScheduleId );
		setSelectedSiteSlugs( schedule?.sites?.map( ( site ) => site.slug ) || [] );
	}, [ selectedScheduleId ] );
	useEffect( () => setSelectedScheduleId( initSelectedScheduleId ), [ initSelectedScheduleId ] );

	const deleteUpdateSchedules = useBatchDeleteUpdateScheduleMutation( selectedSiteSlugs, {
		onSuccess: () => {
			// Refetch again after 5 seconds
			setTimeout( () => {
				refetch();
			}, 5000 );
		},
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
		if ( selectedSiteSlugs && selectedScheduleId ) {
			deleteUpdateSchedules.mutate( selectedScheduleId );
			recordTracksEvent( 'calypso_scheduled_updates_multisite_delete_schedule', {
				site_slugs: selectedSiteSlugs.join( ',' ),
			} );
		}
		closeRemoveConfirm();
	};
	const lowercasedSearchTerm = searchTerm?.toLowerCase();
	const filteredSchedules = schedules
		?.map( ( schedule ) => {
			if ( ! searchTerm || ! searchTerm.length ) {
				return schedule;
			}
			const filteredSites = schedule.sites.filter(
				( site ) =>
					site.title.toLowerCase().includes( lowercasedSearchTerm ) ||
					site.URL.toLowerCase().includes( lowercasedSearchTerm )
			);

			return {
				...schedule,
				sites: filteredSites,
			};
		} )
		.filter( ( schedule ) => schedule.sites.length > 0 );

	const isLoading = isLoadingSchedules;
	const ScheduleListComponent = previewMode === 'table' ? ScheduleListTable : ScheduleListCards;
	const isScheduleEmpty = schedules.length === 0 && isFetched;

	return (
		<div className="plugins-update-manager plugins-update-manager-multisite">
			<div className="plugins-update-manager-multisite__header">
				<h1>{ translate( 'Update schedules' ) }</h1>
				{ showNewScheduleBtn && ! isScheduleEmpty && (
					<Button
						__next40pxDefaultSize={ ! compact }
						isSmall={ compact }
						variant={ compact ? 'secondary' : 'primary' }
						onClick={ onCreateNewSchedule }
						disabled={ false }
					>
						{ translate( 'New schedule' ) }
					</Button>
				) }
			</div>

			<ScheduleErrors />

			{ isScheduleEmpty && ! compact && (
				<ScheduleListEmpty onCreateNewSchedule={ onCreateNewSchedule } />
			) }
			{ isScheduleEmpty && compact && <ScheduleListCardNew className="is-selected" /> }
			{ ! isScheduleEmpty && ScheduleListComponent ? (
				<>
					<ScheduleListFilter compact={ compact } />
					<ScheduleListComponent
						compact={ compact }
						schedules={ filteredSchedules }
						selectedScheduleId={ selectedScheduleId }
						onRemoveClick={ openRemoveDialog }
						onEditClick={ onEditSchedule }
						onLogsClick={ onShowLogs }
					/>
				</>
			) : null }
			{ schedules.length === 0 && isLoading && <Spinner /> }
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
