import { useTranslate } from 'i18n-calypso';
import {
	ListItemCards,
	ListItemCard,
	ListItemCardContent,
	ListItemCardActions,
	type Action,
} from 'calypso/a8c-for-agencies/components/list-item-cards';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { useWooPaymentsContext } from '../context';
import { getSiteData } from '../lib/site-data';
import {
	SiteColumn,
	WooPaymentsStatusColumn,
	CommissionsPaidColumn,
	TimeframeCommissionsColumn,
} from './site-columns';
import type { SitesWithWooPaymentsState } from '../types';

export default function SitesWithWooPaymentsMobileView( {
	items,
	actions,
}: {
	items: SitesWithWooPaymentsState[];
	actions: Action[];
} ) {
	const translate = useTranslate();
	const { woopaymentsData, isLoadingWooPaymentsData } = useWooPaymentsContext();

	return (
		<div className="sites-with-woopayments-list-mobile-view">
			<ListItemCards>
				{ items.map( ( item ) => (
					<ListItemCard key={ item.blogId }>
						<ListItemCardActions actions={ actions } item={ item } />
						<ListItemCardContent title={ translate( 'Site' ) }>
							<div className="sites-with-woopayments-list-mobile-view__column">
								<SiteColumn site={ item.siteUrl } />
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Commissions Paid' ) }>
							<div className="sites-with-woopayments-list-mobile-view__column">
								{ isLoadingWooPaymentsData ? (
									<TextPlaceholder />
								) : (
									<CommissionsPaidColumn
										payout={ getSiteData( woopaymentsData, item.blogId ).payout }
									/>
								) }
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Timeframe Commissions' ) }>
							<div className="sites-with-woopayments-list-mobile-view__column">
								{ isLoadingWooPaymentsData ? (
									<TextPlaceholder />
								) : (
									<TimeframeCommissionsColumn
										estimatedPayout={ getSiteData( woopaymentsData, item.blogId ).estimatedPayout }
									/>
								) }
							</div>
						</ListItemCardContent>
						<ListItemCardContent title={ translate( 'Review status' ) }>
							<WooPaymentsStatusColumn state={ item.state } siteId={ item.blogId } />
						</ListItemCardContent>
					</ListItemCard>
				) ) }
			</ListItemCards>
		</div>
	);
}
