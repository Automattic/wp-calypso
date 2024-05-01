import { useTranslate } from 'i18n-calypso';
import { MultisitePluginUpdateManagerContextProvider } from 'calypso/blocks/plugins-scheduled-updates-multisite/context';
import DocumentHead from 'calypso/components/data/document-head';
import { ScheduleCreate } from './schedule-create';
import { ScheduleList } from './schedule-list';

import './styles.scss';

type Props = {
	onNavBack?: () => void;
	context: 'create' | 'edit' | 'list';
	onEditSchedule: ( id: string ) => void;
	onShowLogs: ( id: string, siteSlug: string ) => void;
	onCreateNewSchedule: () => void;
};

export const PluginsScheduledUpdatesMultisite = ( {
	context,
	onNavBack,
	onCreateNewSchedule,
	onEditSchedule,
	onShowLogs,
}: Props ) => {
	const translate = useTranslate();
	const title = {
		create: translate( 'New schedule' ),
		edit: translate( 'Edit schedule' ),
		list: translate( 'Update schedules' ),
	}[ context ];

	return (
		<MultisitePluginUpdateManagerContextProvider>
			<DocumentHead title={ title } />
			{ ( () => {
				switch ( context ) {
					case 'create':
						return <ScheduleCreate onNavBack={ onNavBack } />;
					case 'list':
						return (
							<ScheduleList
								onCreateNewSchedule={ onCreateNewSchedule }
								onEditSchedule={ onEditSchedule }
								onShowLogs={ onShowLogs }
							/>
						);
					default:
						return <p>TODO</p>;
				}
			} )() }
		</MultisitePluginUpdateManagerContextProvider>
	);
};
