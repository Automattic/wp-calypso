import { agencyWooPaymentsDataQuery } from '@automattic/api-queries';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { Callout } from '../../components/callout';
import { Card, CardBody } from '../../components/card';
import { Text } from '../../components/text';
import { TextSkeleton } from '../../components/text-skeleton';
import OverviewLinkButton from './overview-link-button';
import StatList from './stat-list';
import useWooPaymentsStoreCount from './use-woopayments-store-count';
import WooPaymentsIllustration from './woopayments-illustration';
import type { RecordTracksEvent } from '../tiers/types';

interface WooPaymentsRevenueCardProps {
	agencyId: number;
	locked?: boolean;
	lockedNote?: string;
	woopaymentsHref: string;
	useRouterLink?: boolean;
	recordTracksEvent?: RecordTracksEvent;
}

function WooPaymentsEmptyState( {
	locked,
	lockedNote,
	woopaymentsHref,
	useRouterLink,
	recordTracksEvent,
}: {
	locked?: boolean;
	lockedNote?: string;
	woopaymentsHref: string;
	useRouterLink?: boolean;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	return (
		<Callout
			title={ __( 'WooPayments revenue' ) }
			titleAs="h2"
			image={ <WooPaymentsIllustration title={ __( 'A client store using WooPayments' ) } /> }
			imageVariant="full-bleed"
			description={
				<VStack spacing={ 2 }>
					<Text variant="muted" lineHeight="20px">
						{ __(
							'Earn 0.05% on Total Payments Volume when your clients use WooPayments — automatically, with no ongoing management.'
						) }
					</Text>
					{ lockedNote && (
						<HStack justify="flex-start" expanded={ false }>
							<Badge>{ lockedNote }</Badge>
						</HStack>
					) }
				</VStack>
			}
			actions={
				locked ? undefined : (
					<ButtonStack justify="flex-start">
						<OverviewLinkButton
							size="compact"
							variant="secondary"
							href={ woopaymentsHref }
							useRouterLink={ useRouterLink }
							onClick={ () =>
								recordTracksEvent?.( 'calypso_a4a_overview_woopayments_connect_store_click' )
							}
						>
							{ __( 'Connect a client store' ) }
						</OverviewLinkButton>
					</ButtonStack>
				)
			}
		/>
	);
}

export default function WooPaymentsRevenueCard( {
	agencyId,
	locked,
	lockedNote,
	woopaymentsHref,
	useRouterLink,
	recordTracksEvent,
}: WooPaymentsRevenueCardProps ) {
	const { storeCount, isLoading: isLoadingStoreCount } = useWooPaymentsStoreCount(
		agencyId,
		! locked
	);
	const { data: wooPaymentsData, isPending: isPendingData } = useQuery( {
		...agencyWooPaymentsDataQuery( agencyId ),
		// The revenue payload can't distinguish "no stores", so gate on the store count.
		enabled: !! agencyId && ! locked && storeCount > 0,
	} );
	// isPending rather than isLoading: on the render where the store count resolves
	// and the query flips enabled, isFetching is still false — isLoading would show
	// $0 stats for that frame.
	const isLoading = isLoadingStoreCount || ( storeCount > 0 && isPendingData );

	const total = wooPaymentsData?.data?.total;
	const currentQuarter = wooPaymentsData?.data?.estimated?.current_quarter;

	if ( locked || ( storeCount === 0 && ! isLoading ) ) {
		return (
			<WooPaymentsEmptyState
				locked={ locked }
				lockedNote={ lockedNote }
				woopaymentsHref={ woopaymentsHref }
				useRouterLink={ useRouterLink }
				recordTracksEvent={ recordTracksEvent }
			/>
		);
	}

	const totalProcessed = total?.tpv ?? 0;
	const averagePerStore = storeCount > 0 ? totalProcessed / storeCount : 0;

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<Text size={ 15 } weight={ 500 } lineHeight="20px" as="h2">
						{ __( 'WooPayments revenue' ) }
					</Text>
					<HStack spacing={ 2 } justify="flex-start" alignment="baseline" expanded={ false }>
						<Text size={ 20 } weight={ 500 } lineHeight="24px">
							{ isLoading ? (
								<TextSkeleton length={ 6 } />
							) : (
								formatCurrency( currentQuarter?.payout ?? 0, 'USD' )
							) }
						</Text>
						<Text intent="success" size={ 12 } lineHeight="16px">
							{ __( 'estimated this quarter' ) }
						</Text>
					</HStack>
					<StatList
						isLoading={ isLoading }
						stats={ [
							{ label: __( 'Active stores' ), value: formatNumber( storeCount ) },
							{ label: __( 'Total processed' ), value: formatCurrency( totalProcessed, 'USD' ) },
							{ label: __( 'Avg. per store' ), value: formatCurrency( averagePerStore, 'USD' ) },
						] }
					/>
					<ButtonStack justify="flex-start">
						<OverviewLinkButton
							size="compact"
							variant="secondary"
							href={ woopaymentsHref }
							useRouterLink={ useRouterLink }
							onClick={ () =>
								recordTracksEvent?.( 'calypso_a4a_overview_woopayments_view_details_click' )
							}
						>
							{ __( 'View WooPayments details' ) }
						</OverviewLinkButton>
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
