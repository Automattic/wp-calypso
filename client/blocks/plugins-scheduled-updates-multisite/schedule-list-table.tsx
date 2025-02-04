import { useTranslate } from 'i18n-calypso';
import { SiteSlug } from 'calypso/types';
import { ScheduleListTableRow } from './schedule-list-table-row';
import type { MultisiteSchedulesUpdates } from 'calypso/data/plugins/use-update-schedules-query';

type Props = {
	schedules: MultisiteSchedulesUpdates[];
	onEditClick: ( id: string ) => void;
	onRemoveClick: ( id: string ) => void;
	onLogsClick: ( id: string, siteSlug: SiteSlug ) => void;
	search?: string;
};

export const ScheduleListTable = ( props: Props ) => {
	const { schedules, onEditClick, onLogsClick, onRemoveClick } = props;
	const translate = useTranslate();

	return (
		<div className="plugins-update-manager-multisite-table-container">
			<table className="plugins-update-manager-multisite-table">
				<thead>
					<tr>
						<th className="expand"></th>
						<th>{ translate( 'Name' ) }</th>
						<th>{ translate( 'Sites' ) }</th>
						<th>{ translate( 'Last update' ) }</th>
						<th>{ translate( 'Next update' ) }</th>
						<th className="frequency">{ translate( 'Frequency' ) }</th>
						<th>{ translate( 'Plugins' ) }</th>
						<th>{ translate( 'Active' ) }</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{ schedules.map( ( schedule ) => (
						<ScheduleListTableRow
							schedule={ schedule }
							onEditClick={ onEditClick }
							onRemoveClick={ onRemoveClick }
							onLogsClick={ onLogsClick }
							key={ schedule.id }
						/>
					) ) }

					{ schedules.length === 0 && (
						<tr>
							<td colSpan={ 9 }>
								<div className="empty-state empty-state__center">
									<p>
										{ translate(
											"Oops! We couldn't find any schedules based on your search criteria. You might want to check your search terms and try again."
										) }
									</p>
								</div>
							</td>
						</tr>
					) }
				</tbody>
			</table>
		</div>
	);
};
