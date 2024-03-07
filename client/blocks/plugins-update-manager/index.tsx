import { WPCOM_FEATURES_SCHEDULED_UPDATES } from '@automattic/calypso-products';
import { Button, Spinner } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import ScheduledUpdatesGate from 'calypso/components/scheduled-updates/scheduled-updates-gate';
import { useUpdateScheduleQuery } from 'calypso/data/plugins/use-update-schedules-query';
import { useSelector } from 'calypso/state';
import getHasLoadedSiteFeatures from 'calypso/state/selectors/has-loaded-site-features';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { hasLoadedSitePlansFromServer } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	const siteId = useSelector( getSelectedSiteId );
	const hasScheduledUpdatesFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SCHEDULED_UPDATES )
	);
	const isAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId as number ) );
	const isEligibleForFeature = hasScheduledUpdatesFeature && isAtomic;
	const { data: schedules = [] } = useUpdateScheduleQuery( siteSlug, isEligibleForFeature );
	const isFeaturesLoaded: boolean = useSelector( ( state ) =>
		getHasLoadedSiteFeatures( state, siteId )
	);

	const isSitePlansLoaded: boolean = useSelector( ( state ) =>
		hasLoadedSitePlansFromServer( state, siteId )
	);

	const hideCreateButton =
		! isEligibleForFeature || schedules.length === MAX_SCHEDULES || schedules.length === 0;

	const { canCreateSchedules } = useCanCreateSchedules( siteSlug, isEligibleForFeature );

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
		<PluginUpdateManagerContextProvider
			siteSlug={ siteSlug }
			isEligibleForFeature={ isEligibleForFeature }
		>
			<DocumentHead title={ title } />
			{ ! isSitePlansLoaded && <QuerySitePlans siteId={ siteId } /> }
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
				{ ! isFeaturesLoaded || ! isSitePlansLoaded ? (
					<Spinner className="plugins-update-manager-spinner" />
				) : (
					<ScheduledUpdatesGate
						hasScheduledUpdatesFeature={ hasScheduledUpdatesFeature }
						isAtomic={ isAtomic }
						siteId={ siteId as number }
					>
						{ component }
					</ScheduledUpdatesGate>
				) }
			</MainComponent>
		</PluginUpdateManagerContextProvider>
	);
};
