import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
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
	const isMobile = useMobileBreakpoint();
	const translate = useTranslate();
	const title = {
		create: translate( 'New schedule' ),
		edit: translate( 'Edit schedule' ),
		list: translate( 'Update schedules' ),
	}[ context ];

	return (
		<MultisitePluginUpdateManagerContextProvider>
			<Layout title={ title } wide>
				{ context === 'create' || context === 'edit' ? (
					<LayoutColumn className="schedules-list">List of schedules</LayoutColumn>
				) : null }
				<LayoutColumn wide>
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
										previewMode={ isMobile ? 'card' : 'table' }
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
