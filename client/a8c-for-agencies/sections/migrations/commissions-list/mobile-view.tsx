import { useTranslate } from 'i18n-calypso';
import {
	ListItemCards,
	ListItemCard,
	ListItemCardContent,
} from 'calypso/a8c-for-agencies/components/list-item-cards';
import { MigratedOnColumn, ReviewStatusColumn, SiteColumn } from './commission-columns';
import type { MigrationCommissionItem } from '../types';

import './style.scss';

export default function MigrationsCommissionsListMobileView( {
	commissions,
}: {
	commissions: MigrationCommissionItem[];
} ) {
	const translate = useTranslate();

	return (
		<div className="migrations-commissions-list-mobile-view">
			<ListItemCards>
				{ commissions.map( ( commission ) => (
					<ListItemCard key={ commission.id }>
						<ListItemCardContent title={ translate( 'Site' ) }>
							<div className="migrations-commissions-list-mobile-view__column">
								<SiteColumn site={ commission.siteUrl } />
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Migrated on' ) }>
							<div className="migrations-commissions-list-mobile-view__column">
								<MigratedOnColumn migratedOn={ commission.migratedOn } />
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Review status' ) }>
							<ReviewStatusColumn reviewStatus={ commission.reviewStatus } />
						</ListItemCardContent>
					</ListItemCard>
				) ) }
			</ListItemCards>
		</div>
	);
}
