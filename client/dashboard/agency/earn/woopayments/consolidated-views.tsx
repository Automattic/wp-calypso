import { formatCurrency } from '@automattic/number-formatters';
import {
	__experimentalGrid as Grid,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ConsolidatedStatCard from '../../../components/consolidated-stat-card';
import InlineSupportLink from '../../../components/inline-support-link';
import PayoutCards from '../referrals/payout-cards';
import type { WooPaymentsData } from '@automattic/api-core';

const WOOPAYMENTS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';

interface ConsolidatedViewsProps {
	woopaymentsData?: WooPaymentsData;
	isLoading: boolean;
	/** Each app passes its own user locale for date formatting. */
	locale?: string;
}

export default function ConsolidatedViews( {
	woopaymentsData,
	isLoading,
	locale,
}: ConsolidatedViewsProps ) {
	const totalCommission = woopaymentsData?.data?.total?.payout ?? 0;
	const previousQuarterExpectedCommission =
		woopaymentsData?.data?.estimated?.previous_quarter?.payout ?? 0;
	const currentQuarterExpectedCommission =
		woopaymentsData?.data?.estimated?.current_quarter?.payout ?? 0;

	return (
		<Grid
			className="consolidated-views"
			templateColumns="repeat(auto-fit, minmax(240px, 1fr))"
			gap={ 4 }
		>
			<ConsolidatedStatCard
				value={ formatCurrency( totalCommission, 'USD' ) }
				footerText={ __( 'Total WooPayments commissions paid' ) }
				popoverTitle={ __( 'Total WooPayments commissions paid' ) }
				popoverContent={
					<VStack spacing={ 3 }>
						<Text>
							{ __(
								'The total amount of transactions processed through WooPayments across all your client sites.'
							) }
						</Text>
						<Text>
							<InlineSupportLink supportLink={ WOOPAYMENTS_LEARN_MORE_LINK } forceOpenInHelpCenter>
								{ __( 'Learn more' ) }
							</InlineSupportLink>
						</Text>
					</VStack>
				}
				isLoading={ isLoading }
			/>
			<PayoutCards
				isWooPayments
				isFetching={ isLoading }
				previousQuarterExpectedCommission={ previousQuarterExpectedCommission }
				currentQuarterExpectedCommission={ currentQuarterExpectedCommission }
				locale={ locale }
			/>
		</Grid>
	);
}
