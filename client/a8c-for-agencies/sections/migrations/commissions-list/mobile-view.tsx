import { useTranslate } from 'i18n-calypso';
import {
	ListItemCards,
	ListItemCard,
	ListItemCardActions,
	ListItemCardContent,
	type Action,
} from 'calypso/a8c-for-agencies/components/list-item-cards';
import { MigratedOnColumn, ReviewStatusColumn, SiteColumn } from './commission-columns';
import type { TaggedSite } from '../types';

import './style.scss';

export default function MigrationsCommissionsListMobileView( {
	commissions,
	actions,
}: {
	commissions: TaggedSite[];
	actions: Action[];
} ) {
	const translate = useTranslate();

	return (
		<div className="migrations-commissions-list-mobile-view">
			<ListItemCards>
				{ commissions.map( ( commission ) => {
					return (
						<ListItemCard key={ commission.id }>
							<ListItemCardActions actions={ actions } item={ commission } />
							<ListItemCardContent title={ translate( 'Site' ) }>
								<div className="migrations-commissions-list-mobile-view__column">
									<SiteColumn site={ commission.url } />
								</div>
							</ListItemCardContent>
							{
								// FIXME: This should be "Migrated on" instead of "Date added"
								// We will change this when the MC tool is implemented and we have the migration date
								<ListItemCardContent title={ translate( 'Date added' ) }>
									<div className="migrations-commissions-list-mobile-view__column">
										<MigratedOnColumn migratedOn={ commission.created_at } />
									</div>
								</ListItemCardContent>
							}
							<ListItemCardContent title={ translate( 'Review status' ) }>
								<ReviewStatusColumn reviewStatus={ commission.incentive_status } />
							</ListItemCardContent>
						</ListItemCard>
					);
				} ) }
			</ListItemCards>
		</div>
	);
}
