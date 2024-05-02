import { useMobileBreakpoint } from '@automattic/viewport-react';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	Button,
	Notice,
	Spinner,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState } from 'react';
import { MultisitePluginUpdateManagerContext } from 'calypso/blocks/plugins-scheduled-updates-multisite/context';
import { useErrors } from 'calypso/blocks/plugins-scheduled-updates-multisite/hooks/use-errors';
import { useBatchDeleteUpdateScheduleMutation } from 'calypso/data/plugins/use-update-schedules-mutation';
import { useMultisiteUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ScheduleListFilter } from './schedule-list-filter';
import { ScheduleListTable } from './schedule-list-table';

import './styles.scss';

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
	const { searchTerm } = useContext( MultisitePluginUpdateManagerContext );
	const [ removeDialogOpen, setRemoveDialogOpen ] = useState( false );
	const [ selectedScheduleId, setSelectedScheduleId ] = useState< string | undefined >();
	const [ selectedSiteSlugs, setSelectedSiteSlugs ] = useState< string[] >( [] );

	const { clearErrors, errors } = useErrors();

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
	const ScheduleListComponent = isMobile ? null : ScheduleListTable;

	return (
		<div className="plugins-update-manager plugins-update-manager-multisite">
			<div className="plugins-update-manager-multisite__header">
				<h1>{ translate( 'Update schedules' ) }</h1>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ onCreateNewSchedule }
					disabled={ false }
				>
					{ translate( 'New schedule' ) }
				</Button>
			</div>
			{ errors.length ? (
				<Notice status="warning" isDismissible={ true } onDismiss={ () => clearErrors() }>
					{ translate(
						'An error was encountered while creating the schedule.',
						'Some errors were encountered while creating the schedule.',
						{ count: errors.length }
					) }
					<ul>
						{ errors.map( ( error, idx ) => (
							<li key={ `${ error.siteSlug }.${ idx }` }>
								<strong>{ error.site?.title }: </strong> { error.error }
							</li>
						) ) }
					</ul>
				</Notice>
			) : null }
			{ schedules.length === 0 && isLoading && <Spinner /> }
			{ isFetched && filteredSchedules && ScheduleListComponent ? (
				<>
					<ScheduleListFilter />
					<ScheduleListComponent
						schedules={ filteredSchedules }
						onRemoveClick={ openRemoveDialog }
						onEditClick={ onEditSchedule }
						onLogsClick={ onShowLogs }
					/>
				</>
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
