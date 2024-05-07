import { useTranslate } from 'i18n-calypso';
import { MultisitePluginUpdateManagerContextProvider } from 'calypso/blocks/plugins-scheduled-updates-multisite/context';
import DocumentHead from 'calypso/components/data/document-head';
import { ScheduleCreate } from './schedule-create';
import { ScheduleEdit } from './schedule-edit';
import { ScheduleList } from './schedule-list';

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

					case 'edit':
						return <ScheduleEdit id={ id! } onNavBack={ onNavBack } />;
					case 'list':
					default:
						return (
							<ScheduleList
								onCreateNewSchedule={ onCreateNewSchedule }
								onEditSchedule={ onEditSchedule }
								onShowLogs={ onShowLogs }
							/>
						);
				}
			} )() }
		</MultisitePluginUpdateManagerContextProvider>
	);
};
