import { Button } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { useScheduleUpdatesQuery } from 'calypso/data/plugins/use-schedule-updates-query';
import { MAX_SCHEDULES } from './config';
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
	onEditSchedule?: ( id: string ) => void;
}
export const PluginsUpdateManager = ( props: Props ) => {
	const { siteSlug, context, scheduleId, onNavBack, onCreateNewSchedule, onEditSchedule } = props;
	const { data: schedules = [] } = useScheduleUpdatesQuery( siteSlug );
	const hideCreateButton = schedules.length === MAX_SCHEDULES || schedules.length === 0;

	return (
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
						variant="primary"
						onClick={ onCreateNewSchedule }
					>
						Create a new schedule
					</Button>
				) }
			</NavigationHeader>

			{
				{
					list: (
						<ScheduleList
							siteSlug={ siteSlug }
							onNavBack={ onNavBack }
							onCreateNewSchedule={ onCreateNewSchedule }
							onEditSchedule={ onEditSchedule }
						/>
					),
					create: <ScheduleCreate siteSlug={ siteSlug } onNavBack={ onNavBack } />,
					edit: (
						<ScheduleEdit siteSlug={ siteSlug } scheduleId={ scheduleId } onNavBack={ onNavBack } />
					),
				}[ context ]
			}
		</MainComponent>
	);
};
