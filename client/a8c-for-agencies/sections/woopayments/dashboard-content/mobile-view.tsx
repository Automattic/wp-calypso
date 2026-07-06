import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Card,
	CardBody,
	DropdownMenu,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { useWooPaymentsContext } from '../context';
import { getSiteData } from '../lib/site-data';
import {
	SiteColumn,
	WooPaymentsStatusColumn,
	CommissionEligibilityColumn,
	TransactionsColumn,
	CommissionsPaidColumn,
	TimeframeCommissionsColumn,
} from './site-columns';
import TextSkeleton from './text-skeleton';
import type { SitesWithWooPaymentsState } from '../types';

export interface SiteAction {
	id: string;
	label: string;
	callback: ( items: SitesWithWooPaymentsState[] ) => void;
	isEligible?: ( item: SitesWithWooPaymentsState ) => boolean;
}

const SiteCardRow = ( { title, children }: { title: string; children: React.ReactNode } ) => (
	<VStack spacing={ 1 }>
		<Text variant="muted">{ title }</Text>
		<div className="sites-with-woopayments-list-mobile-view__column">{ children }</div>
	</VStack>
);

export default function SitesWithWooPaymentsMobileView( {
	items,
	actions,
}: {
	items: SitesWithWooPaymentsState[];
	actions: SiteAction[];
} ) {
	const { woopaymentsData, isLoadingWooPaymentsData } = useWooPaymentsContext();

	return (
		<VStack className="sites-with-woopayments-list-mobile-view" spacing={ 3 }>
			{ items.map( ( item ) => {
				const siteData = getSiteData( woopaymentsData, item.blogId );
				const eligibleActions = actions.filter( ( action ) => action.isEligible?.( item ) ?? true );

				return (
					<Card key={ item.blogId }>
						<CardBody>
							<VStack spacing={ 4 }>
								{ eligibleActions.length > 0 && (
									<HStack justify="flex-end">
										<DropdownMenu
											icon={ moreVertical }
											label={ __( 'Actions' ) }
											controls={ eligibleActions.map( ( action ) => ( {
												title: action.label,
												onClick: () => action.callback( [ item ] ),
											} ) ) }
										/>
									</HStack>
								) }
								<SiteCardRow title={ __( 'Site' ) }>
									<SiteColumn site={ item.siteUrl } />
								</SiteCardRow>
								<SiteCardRow title={ __( 'Transactions' ) }>
									{ isLoadingWooPaymentsData ? (
										<TextSkeleton />
									) : (
										<TransactionsColumn transactions={ siteData.transactions } />
									) }
								</SiteCardRow>
								<SiteCardRow title={ __( 'Commissions paid' ) }>
									{ isLoadingWooPaymentsData ? (
										<TextSkeleton />
									) : (
										<CommissionsPaidColumn payout={ siteData.payout } />
									) }
								</SiteCardRow>
								<SiteCardRow title={ __( 'Timeframe commissions' ) }>
									{ isLoadingWooPaymentsData ? (
										<TextSkeleton />
									) : (
										<TimeframeCommissionsColumn estimatedPayout={ siteData.estimatedPayout } />
									) }
								</SiteCardRow>
								<SiteCardRow title={ __( 'WooPayments status' ) }>
									<WooPaymentsStatusColumn state={ item.state } siteId={ item.blogId } />
								</SiteCardRow>
								<SiteCardRow title={ __( 'Commission eligibility' ) }>
									<CommissionEligibilityColumn
										state={ item.state }
										siteId={ item.blogId }
										woopaymentsData={ woopaymentsData }
									/>
								</SiteCardRow>
							</VStack>
						</CardBody>
					</Card>
				);
			} ) }
		</VStack>
	);
}
