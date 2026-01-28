import { HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteCrontabsQuery,
	siteCrontabDeleteMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Icon, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { scheduled, trash, copy } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import ConfirmModal from '../../components/confirm-modal';
import { DataViewsCard } from '../../components/dataviews';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import AddCrontabForm from './add-crontab-form';
import type { Crontab } from '@automattic/api-core';

function formatSchedule( schedule: string ): string {
	// Handle predefined schedules
	if ( schedule === 'hourly' ) {
		return __( 'Every hour' );
	}
	if ( schedule === 'twicedaily' ) {
		return __( 'Twice daily' );
	}
	if ( schedule === 'daily' ) {
		return __( 'Daily' );
	}
	if ( schedule === 'weekly' ) {
		return __( 'Weekly' );
	}

	// Handle shorthand notation
	const shorthandMatch = schedule.match( /^(\d+)([hdw])$/ );
	if ( shorthandMatch ) {
		const num = parseInt( shorthandMatch[ 1 ], 10 );
		const freq = shorthandMatch[ 2 ];
		if ( freq === 'h' ) {
			return sprintf(
				/* translators: %d is the number of times per hour */
				__( '%d times per hour' ),
				num
			);
		}
		if ( freq === 'd' ) {
			return sprintf(
				/* translators: %d is the number of times per day */
				__( '%d times per day' ),
				num
			);
		}
		if ( freq === 'w' ) {
			return sprintf(
				/* translators: %d is the number of times per week */
				__( '%d times per week' ),
				num
			);
		}
	}

	// Return raw cron expression for standard cron format
	return schedule;
}

export default function CrontabSettings( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const hasSshFeature = hasHostingFeature( site, HostingFeatures.SSH );

	const { data: crontabs, isLoading } = useQuery( {
		...siteCrontabsQuery( site.ID ),
		enabled: hasSshFeature,
	} );

	const [ showAddForm, setShowAddForm ] = useState( false );
	const [ selectedCrontabToRemove, setSelectedCrontabToRemove ] = useState< Crontab | null >(
		null
	);

	const { mutate: deleteCrontab, isPending: isDeletingCrontab } = useMutation(
		siteCrontabDeleteMutation( site.ID )
	);

	const handleDelete = () => {
		if ( selectedCrontabToRemove ) {
			deleteCrontab( selectedCrontabToRemove.cron_id, {
				onSuccess: () => {
					createSuccessNotice( __( 'Scheduled job deleted.' ), { type: 'snackbar' } );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to delete scheduled job.' ), { type: 'snackbar' } );
				},
				onSettled: () => {
					setSelectedCrontabToRemove( null );
				},
			} );
		}
	};

	const handleCopyCommand = async ( command: string ) => {
		try {
			await navigator.clipboard.writeText( command );
			createSuccessNotice( __( 'Command copied.' ), { type: 'snackbar' } );
		} catch {
			createErrorNotice( __( 'Failed to copy command.' ), { type: 'snackbar' } );
		}
	};

	const totalItems = crontabs?.length ?? 0;

	const fields =
		totalItems > 0
			? [
					{
						id: 'schedule',
						label: __( 'Schedule' ),
						getValue: ( { item }: { item: Crontab } ) => formatSchedule( item.schedule ),
						render: ( { item }: { item: Crontab } ) => (
							<span title={ item.schedule }>{ formatSchedule( item.schedule ) }</span>
						),
					},
					{
						id: 'command',
						label: __( 'Command' ),
						getValue: ( { item }: { item: Crontab } ) => item.command,
						render: ( { item }: { item: Crontab } ) => (
							<code
								style={ {
									maxWidth: '300px',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
									display: 'block',
								} }
								title={ item.command }
							>
								{ item.command }
							</code>
						),
					},
			  ]
			: [];

	const view = {
		type: 'table' as const,
		titleField: 'schedule',
		...( totalItems > 0 ? { fields: [ 'command' ] } : {} ),
	};

	const actions =
		totalItems > 0
			? [
					{
						id: 'copy-command',
						label: __( 'Copy command' ),
						icon: <Icon icon={ copy } />,
						callback: ( items: Crontab[] ) => {
							handleCopyCommand( items[ 0 ].command );
						},
					},
					{
						id: 'delete',
						isPrimary: true,
						isDestructive: true,
						icon: <Icon icon={ trash } />,
						label: __( 'Delete' ),
						callback: ( items: Crontab[] ) => {
							setSelectedCrontabToRemove( items[ 0 ] );
						},
					},
			  ]
			: [];

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Cron' ) }
					description={ __(
						'Schedule commands to run automatically at specified intervals on your site.'
					) }
					actions={
						hasSshFeature &&
						! showAddForm && (
							<Button
								variant="primary"
								__next40pxDefaultSize
								onClick={ () => setShowAddForm( true ) }
							>
								{ __( 'Add scheduled job' ) }
							</Button>
						)
					}
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.SSH }
				upsellId="site-settings-crontab"
				upsellIcon={ scheduled }
				upsellTitle={ __( 'Automate tasks with cron jobs' ) }
				upsellDescription={ __( 'Schedule commands to run automatically at specified intervals.' ) }
			>
				{ showAddForm && (
					<AddCrontabForm
						siteId={ site.ID }
						onSuccess={ () => setShowAddForm( false ) }
						onCancel={ () => setShowAddForm( false ) }
					/>
				) }
				<DataViewsCard>
					<DataViews< Crontab >
						getItemId={ ( item ) => String( item.cron_id ) }
						data={ crontabs ?? [] }
						fields={ totalItems > 0 ? fields : [] }
						actions={ actions }
						view={ view }
						isLoading={ isLoading }
						onChangeView={ () => {} }
						defaultLayouts={ { table: {} } }
						paginationInfo={ { totalItems, totalPages: 1 } }
						empty={ <p>{ __( 'No jobs scheduled.' ) }</p> }
					>
						<DataViews.Layout />
					</DataViews>
				</DataViewsCard>
			</HostingFeatureGatedWithCallout>
			<ConfirmModal
				isOpen={ !! selectedCrontabToRemove }
				confirmButtonProps={ {
					label: __( 'Delete' ),
					isBusy: isDeletingCrontab,
					disabled: isDeletingCrontab,
				} }
				onCancel={ () => setSelectedCrontabToRemove( null ) }
				onConfirm={ handleDelete }
			>
				{ createInterpolateElement(
					__(
						'Are you sure you want to delete this scheduled job? The command <command /> will no longer run automatically.'
					),
					{
						command: (
							<code style={ { wordBreak: 'break-all' } }>{ selectedCrontabToRemove?.command }</code>
						),
					}
				) }
			</ConfirmModal>
		</PageLayout>
	);
}
