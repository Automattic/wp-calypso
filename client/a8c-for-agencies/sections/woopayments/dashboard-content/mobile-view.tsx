import { useTranslate } from 'i18n-calypso';
import {
	ListItemCards,
	ListItemCard,
	ListItemCardContent,
} from 'calypso/a8c-for-agencies/components/list-item-cards';
import {
	SiteColumn,
	WooPaymentsStatusColumn,
	TransactionsColumn,
	CommissionsPaidColumn,
} from './site-columns';
import type { SitesWithWooPaymentsState } from '../types';

import './style.scss';

export default function SitesWithWooPaymentsMobileView( {
	items,
}: {
	items: SitesWithWooPaymentsState[];
} ) {
	const translate = useTranslate();

	return (
		<div className="sites-with-woopayments-list-mobile-view">
			<ListItemCards>
				{ items.map( ( item ) => (
					<ListItemCard key={ item.blogId }>
						<ListItemCardContent title={ translate( 'Site' ) }>
							<div className="sites-with-woopayments-list-mobile-view__column">
								<SiteColumn site={ item.siteUrl } />
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Transactions' ) }>
							<div className="sites-with-woopayments-list-mobile-view__column">
								<TransactionsColumn transactions={ item.transactions } />
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Commissions Paid' ) }>
							<div className="sites-with-woopayments-list-mobile-view__column">
								<CommissionsPaidColumn payout={ item.payout } />
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Review status' ) }>
							<WooPaymentsStatusColumn state={ item.state } siteUrl={ item.siteUrl } />
						</ListItemCardContent>
					</ListItemCard>
				) ) }
			</ListItemCards>
		</div>
	);
}
