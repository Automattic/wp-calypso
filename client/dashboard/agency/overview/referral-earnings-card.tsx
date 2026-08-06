import { referralCommissionPayoutQuery, referralsQuery } from '@automattic/api-queries';
import { formatCurrency, formatNumber } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { Text } from '../../components/text';
import { TextSkeleton } from '../../components/text-skeleton';
import useConsolidatedPayoutData from '../earn/referrals/hooks/use-consolidated-payout-data';
import OverviewLinkButton from './overview-link-button';
import StatList from './stat-list';
import type { RecordTracksEvent } from '../tiers/types';

interface ReferralEarningsCardProps {
	agencyId: number;
	locked?: boolean;
	lockedNote?: string;
	referralsHref: string;
	shouldUseRouterLink?: boolean;
	recordTracksEvent?: RecordTracksEvent;
}

function ReferralEarningsEmptyState( {
	locked,
	lockedNote,
	referralsHref,
	shouldUseRouterLink,
	recordTracksEvent,
}: {
	locked?: boolean;
	lockedNote?: string;
	referralsHref: string;
	shouldUseRouterLink?: boolean;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	return (
		<VStack spacing={ 4 }>
			<Heading level={ 2 } size={ 15 } weight={ 500 } lineHeight="20px">
				{ __( 'Referral earnings' ) }
			</Heading>
			<Text variant="muted" lineHeight="20px">
				{ __(
					'Earn 20% recurring commissions on hosting and 50% on plugins when you refer clients through your dashboard.'
				) }
			</Text>
			{ lockedNote && (
				<HStack justify="flex-start" expanded={ false }>
					<Badge>{ lockedNote }</Badge>
				</HStack>
			) }
			{ ! locked && (
				<ButtonStack justify="flex-start">
					<OverviewLinkButton
						size="compact"
						variant="secondary"
						href={ referralsHref }
						shouldUseRouterLink={ shouldUseRouterLink }
						onClick={ () =>
							recordTracksEvent?.( 'calypso_a4a_overview_referrals_make_referral_click' )
						}
					>
						{ __( 'Make a referral' ) }
					</OverviewLinkButton>
				</ButtonStack>
			) }
		</VStack>
	);
}

// Not OverviewCard: it renders the whole card as a single link, while this card
// needs inline actions and non-interactive stat rows.
export default function ReferralEarningsCard( {
	agencyId,
	locked,
	lockedNote,
	referralsHref,
	shouldUseRouterLink,
	recordTracksEvent,
}: ReferralEarningsCardProps ) {
	const { data: referrals = [], isLoading: isLoadingReferrals } = useQuery( {
		...referralsQuery( agencyId ),
		enabled: !! agencyId && ! locked,
	} );
	const { data: referralCommissionPayout, isLoading: isLoadingPayout } = useQuery( {
		...referralCommissionPayoutQuery( agencyId ),
		enabled: !! agencyId && ! locked,
	} );
	const isLoading = isLoadingReferrals || isLoadingPayout;
	const { previousQuarterExpectedCommission, currentQuarterExpectedCommission } =
		useConsolidatedPayoutData( referrals );

	const hasReferrals = referrals.length > 0;

	if ( locked || ( ! hasReferrals && ! isLoading ) ) {
		return (
			<Card>
				<CardBody>
					<ReferralEarningsEmptyState
						locked={ locked }
						lockedNote={ lockedNote }
						referralsHref={ referralsHref }
						shouldUseRouterLink={ shouldUseRouterLink }
						recordTracksEvent={ recordTracksEvent }
					/>
				</CardBody>
			</Card>
		);
	}

	const activeReferrals = referrals.filter( ( referral ) =>
		referral.referralStatuses.includes( 'active' )
	).length;

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<Heading level={ 2 } size={ 15 } weight={ 500 } lineHeight="20px">
						{ __( 'Referral earnings' ) }
					</Heading>
					<HStack spacing={ 2 } justify="flex-start" alignment="baseline" expanded={ false }>
						<Text size={ 20 } weight={ 500 } lineHeight="24px">
							{ isLoading ? (
								<TextSkeleton length={ 6 } />
							) : (
								formatCurrency( currentQuarterExpectedCommission, 'USD' )
							) }
						</Text>
						<Text intent="success" size={ 12 } lineHeight="16px">
							{ __( 'estimated this quarter' ) }
						</Text>
					</HStack>
					<StatList
						isLoading={ isLoading }
						stats={ [
							{ label: __( 'Active referrals' ), value: formatNumber( activeReferrals ) },
							{
								label: __( 'Pending payout' ),
								value: formatCurrency( previousQuarterExpectedCommission, 'USD' ),
							},
							{
								label: __( 'Lifetime earnings' ),
								value: formatCurrency( referralCommissionPayout?.total_commission ?? 0, 'USD' ),
							},
						] }
					/>
					<ButtonStack justify="flex-start">
						<OverviewLinkButton
							size="compact"
							variant="secondary"
							href={ referralsHref }
							shouldUseRouterLink={ shouldUseRouterLink }
							onClick={ () =>
								recordTracksEvent?.( 'calypso_a4a_overview_referrals_view_details_click' )
							}
						>
							{ __( 'View referral details' ) }
						</OverviewLinkButton>
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
