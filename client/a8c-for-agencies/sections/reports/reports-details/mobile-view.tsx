import { useTranslate } from 'i18n-calypso';
import {
	ListItemCards,
	ListItemCard,
	ListItemCardContent,
	ListItemCardActions,
	type Action,
} from 'calypso/a8c-for-agencies/components/list-item-cards';
import { ReportStatusColumn, ReportDateColumn } from '../primary/dashboard/report-columns';
import type { Report } from '../types';

export default function ReportsMobileView( {
	reports,
	actions,
}: {
	reports: Report[];
	actions: Action[];
} ) {
	const translate = useTranslate();

	return (
		<div className="reports-details-mobile-view">
			<ListItemCards>
				{ reports.map( ( report ) => (
					<ListItemCard key={ report.id }>
						<ListItemCardActions actions={ actions } item={ report } />
						<ListItemCardContent title={ translate( 'Status' ) }>
							<div className="reports-details-mobile-view__column">
								<ReportStatusColumn status={ report.status } />
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Created' ) }>
							<div className="reports-details-mobile-view__column">
								<ReportDateColumn date={ report.created_at } />
							</div>
						</ListItemCardContent>
					</ListItemCard>
				) ) }
			</ListItemCards>
		</div>
	);
}
