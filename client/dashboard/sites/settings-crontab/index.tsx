import { HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteCrontabsQuery,
	siteCrontabDeleteMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Icon, Button, __experimentalText as Text } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { scheduled, trash, copy } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import cronstrue from 'cronstrue';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { useLocale } from '../../app/locale';
import { siteSettingsCrontabAddRoute, siteSettingsCrontabEditRoute } from '../../app/router/sites';
import ConfirmModal from '../../components/confirm-modal';
import { DataViewsCard } from '../../components/dataviews';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { parseScheduleValue, PREDEFINED_SCHEDULES } from './schedule-field';
import type { Crontab } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

function getScheduleLabel( schedule: string ): string {
	const scheduleType = parseScheduleValue( schedule );
	return PREDEFINED_SCHEDULES.find( ( s ) => s.value === scheduleType )?.label ?? '';
}

const DEFAULT_VIEW: View = {
	type: 'table',
	perPage: 20,
	page: 1,
	fields: [ 'command' ],
	titleField: 'schedule',
};

export default function CrontabSettings( { siteSlug }: { siteSlug: string } ) {
	const router = useRouter();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const locale = useLocale();

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const hasSshFeature = hasHostingFeature( site, HostingFeatures.SSH );

	const { data: crontabs = [], isLoading: isLoadingCrontabs } = useQuery( {
		...siteCrontabsQuery( site.ID ),
		enabled: hasSshFeature,
	} );

	const [ selectedCrontabToRemove, setSelectedCrontabToRemove ] = useState< Crontab | null >(
		null
	);
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

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

	const fields = [
		{
			id: 'schedule',
			label: __( 'Schedule' ),
			getValue: ( { item }: { item: Crontab } ) => {
				const label = getScheduleLabel( item.schedule );
				const cronDescription = cronstrue.toString( item.schedule, {
					verbose: true,
					locale,
				} );
				return `${ label } ${ cronDescription } ${ item.schedule }`;
			},
			render: ( { item }: { item: Crontab } ) => {
				const cronDescription = cronstrue.toString( item.schedule, {
					verbose: true,
					locale,
				} );

				return (
					<div>
						<Text>{ getScheduleLabel( item.schedule ) }</Text>{ ' ' }
						<Text variant="muted" size={ 12 }>
							({ cronDescription })
						</Text>
					</div>
				);
			},
			enableGlobalSearch: true,
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
			enableGlobalSearch: true,
		},
	];

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( crontabs, view, fields );

	const actions = [
		{
			id: 'copy-command',
			label: __( 'Copy command' ),
			icon: <Icon icon={ copy } />,
			callback: ( items: Crontab[] ) => {
				handleCopyCommand( items[ 0 ].command );
			},
		},
		{
			id: 'edit',
			label: __( 'Edit' ),
			callback: ( items: Crontab[] ) => {
				router.navigate( {
					to: siteSettingsCrontabEditRoute.fullPath,
					params: { siteSlug, cronId: items[ 0 ].cron_id },
				} );
			},
		},
		{
			id: 'delete',
			isDestructive: true,
			icon: <Icon icon={ trash } />,
			label: __( 'Delete' ),
			callback: ( items: Crontab[] ) => {
				setSelectedCrontabToRemove( items[ 0 ] );
			},
		},
	];

	const hasFilterOrSearch = ( view.filters && view.filters.length > 0 ) || view.search;
	const emptyTitle = hasFilterOrSearch ? __( 'No jobs found' ) : __( 'No jobs scheduled.' );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Cron' ) }
					description={ createInterpolateElement(
						__(
							'Schedule commands to run automatically at specified intervals. <learnMoreLink />'
						),
						{
							learnMoreLink: <InlineSupportLink supportContext="hosting-cron" />,
						}
					) }
					actions={
						hasSshFeature && (
							<Button
								variant="primary"
								__next40pxDefaultSize
								onClick={ () =>
									router.navigate( {
										to: siteSettingsCrontabAddRoute.fullPath,
										params: { siteSlug },
									} )
								}
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
				<DataViewsCard>
					<DataViews< Crontab >
						getItemId={ ( item ) => String( item.cron_id ) }
						data={ filteredData }
						fields={ filteredData.length > 0 ? fields : [] }
						actions={ filteredData.length > 0 ? actions : [] }
						view={ view }
						onChangeView={ setView }
						isLoading={ isLoadingCrontabs }
						defaultLayouts={ { table: {} } }
						paginationInfo={ paginationInfo }
						empty={ <p>{ emptyTitle }</p> }
					/>
				</DataViewsCard>
			</HostingFeatureGatedWithCallout>
			<ConfirmModal
				isOpen={ !! selectedCrontabToRemove }
				confirmButtonProps={ {
					label: __( 'Delete' ),
					isBusy: isDeletingCrontab,
					disabled: isDeletingCrontab,
					isDestructive: true,
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
