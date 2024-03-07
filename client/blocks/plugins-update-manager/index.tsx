import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MAX_SCHEDULES } from './config';
import { PluginUpdateManagerContextProvider } from './context';
import { useCanCreateSchedules } from './hooks/use-can-create-schedules';
import { ScheduleCreate } from './schedule-create';
import { ScheduleEdit } from './schedule-edit';
import { ScheduleList } from './schedule-list';

import './styles.scss';

interface Props {
	siteSlug: string;
	context: 'list' | 'create' | 'edit';
	scheduleId?: string;
	onNavBack?: () => void;
	onCreateNewSchedule?: () => void;
	onEditSchedule: ( id: string ) => void;
}

export const PluginsUpdateManager = ( props: Props ) => {
	const { siteSlug, context, scheduleId, onNavBack, onCreateNewSchedule, onEditSchedule } = props;
	const { data: schedules = [] } = useUpdateScheduleQuery( siteSlug );
	const hideCreateButton = schedules.length === MAX_SCHEDULES || schedules.length === 0;

	const { canCreateSchedules } = useCanCreateSchedules( siteSlug );
	useEffect( () => {
		recordTracksEvent( 'calypso_update_manager_page_view', {
			site_slug: siteSlug,
			context: context,
		} );
	}, [ context, siteSlug ] );

	const { component, title } = {
		list: {
			component: (
				<ScheduleList
					onNavBack={ onNavBack }
					onCreateNewSchedule={ onCreateNewSchedule }
					onEditSchedule={ onEditSchedule }
				/>
			),
			title: 'List schedules',
		},
		create: {
			component: <ScheduleCreate onNavBack={ onNavBack } />,
			title: 'Create a new schedule',
		},
		edit: {
			component: <ScheduleEdit scheduleId={ scheduleId } onNavBack={ onNavBack } />,
			title: 'Edit schedule',
		},
	}[ context ];

	return (
		<PluginUpdateManagerContextProvider siteSlug={ siteSlug }>
			<DocumentHead title={ title } />

			<MainComponent wideLayout>
				<NavigationHeader
					navigationItems={ [] }
					title="Plugin updates manager"
					subtitle="Effortlessly schedule plugin auto-updates with built-in rollback logic."
				>
					{ context === 'list' && ! hideCreateButton && onCreateNewSchedule && (
						<Button
							__next40pxDefaultSize
							icon={ plus }
							variant={ canCreateSchedules ? 'primary' : 'secondary' }
							onClick={ onCreateNewSchedule }
							disabled={ ! canCreateSchedules }
						>
							Create a new schedule
						</Button>
					) }
				</NavigationHeader>
				{ component }
			</MainComponent>
		</PluginUpdateManagerContextProvider>
	);
};
