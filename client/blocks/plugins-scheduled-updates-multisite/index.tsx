import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import { useLoadScheduleFromId } from 'calypso/blocks/plugins-scheduled-updates-multisite/hooks/use-load-schedule-from-id';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MultisitePluginUpdateManagerContextProvider } from './context';
import { ScheduleCreate } from './schedule-create';
import { ScheduleEdit } from './schedule-edit';
import { ScheduleList } from './schedule-list';

import 'calypso/sites-dashboard-v2/dotcom-style.scss';
import './styles.scss';

type Props = {
	onNavBack?: () => void;
	id?: string;
	context: 'create' | 'edit' | 'list';
	onEditSchedule: ( id: string ) => void;
	onShowLogs: ( id: string, siteSlug: string ) => void;
	onCreateNewSchedule: () => void;
};

export const PluginsScheduledUpdatesMultisite = ( {
	context,
	id,
	onNavBack,
	onCreateNewSchedule,
	onEditSchedule,
	onShowLogs,
}: Props ) => {
	const { schedule: selectedSchedule } = useLoadScheduleFromId( id! );
	const isSmallScreen = useBreakpoint( '<660px' );
	const translate = useTranslate();
	const title = {
		create: translate( 'New schedule' ),
		edit: translate( 'Edit schedule' ),
		list: translate( 'Scheduled Updates' ),
	}[ context ];

	useEffect( () => {
		recordTracksEvent( 'calypso_scheduled_updates_multisite_page_view', {
			context: context,
		} );
	}, [ context ] );

	return (
		<MultisitePluginUpdateManagerContextProvider>
			<Layout title={ title } wide disableGuidedTour>
				{ context === 'create' || context === 'edit' ? (
					<LayoutColumn className="scheduled-updates-list-compact">
						<ScheduleList
							compact
							previewMode="card"
							showNewScheduleBtn={ context === 'edit' }
							selectedScheduleId={ selectedSchedule?.schedule_id }
							onCreateNewSchedule={ onCreateNewSchedule }
							onEditSchedule={ onEditSchedule }
							onShowLogs={ onShowLogs }
						/>
					</LayoutColumn>
				) : null }
				<LayoutColumn className={ `scheduled-updates-${ context }` } wide>
					{ ( () => {
						switch ( context ) {
							case 'create':
								return <ScheduleCreate onNavBack={ onNavBack } />;
							case 'edit':
								return <ScheduleEdit id={ id! } onNavBack={ onNavBack } />;
							case 'list':
							default:
								return (
									<ScheduleList
										previewMode={ isSmallScreen ? 'card' : 'table' }
										onCreateNewSchedule={ onCreateNewSchedule }
										onEditSchedule={ onEditSchedule }
										onShowLogs={ onShowLogs }
									/>
								);
						}
					} )() }
				</LayoutColumn>
			</Layout>
		</MultisitePluginUpdateManagerContextProvider>
	);
};
