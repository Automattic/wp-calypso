import { formatCurrency } from '@automattic/number-formatters';
import { Button, __experimentalGrid as Grid } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../../components/inline-support-link';
import ConsolidatedStatCard from './consolidated-stat-card';
import useConsolidatedPayoutData from './hooks/use-consolidated-payout-data';
import { downloadCommissionsCsv } from './lib/download-commissions-csv';
import PayoutCards from './payout-cards';
import type { AgencyProduct, Referral, ReferralCommissionPayout } from '@automattic/api-core';

const AGENCY_EARNINGS_LEARN_MORE_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/';

function findClientTotalCommission(
	referral: Referral,
	referralCommissionPayout?: ReferralCommissionPayout
): number | undefined {
	if ( ! referralCommissionPayout?.client_data?.length ) {
		return undefined;
	}
	const client = referralCommissionPayout.client_data.find(
		( c ) =>
			c.client_user_id === referral.client.id ||
			c.email?.toLowerCase() === referral.client.email?.toLowerCase()
	);
	return client?.total_commission;
}

interface ConsolidatedViewsProps {
	referrals: Referral[];
	referralCommissionPayout?: ReferralCommissionPayout;
	isSingleClient?: boolean;
	isLoading?: boolean;
	isLoadingCommissionPayout?: boolean;
	/** Each app passes its own user locale for date formatting. */
	locale?: string;
	/** Product catalog for resolving commission rates in the CSV export. */
	products?: AgencyProduct[];
	/** Each app passes its own analytics client. */
	recordTracksEvent?: ( eventName: string, properties?: Record< string, unknown > ) => void;
}

export default function ConsolidatedViews( {
	referrals,
	referralCommissionPayout,
	isSingleClient,
	isLoading,
	isLoadingCommissionPayout,
	locale,
	products,
	recordTracksEvent,
}: ConsolidatedViewsProps ) {
	const { previousQuarterExpectedCommission, currentQuarterExpectedCommission, pendingOrders } =
		useConsolidatedPayoutData( referrals );

	const totalPayouts = isSingleClient
		? findClientTotalCommission( referrals[ 0 ], referralCommissionPayout )
		: referralCommissionPayout?.total_commission;

	const handleDownloadCsv = () => {
		recordTracksEvent?.( 'calypso_a4a_referrals_download_commissions_csv', {
			detailed_view: isSingleClient,
		} );
		downloadCommissionsCsv( {
			referrals,
			products: products ?? [],
			referralCommissionPayout,
			isSingleClient,
			clientEmail: isSingleClient ? referrals[ 0 ]?.client?.email : undefined,
		} );
	};

	// Referrals supply each row's quantity and commission rate, so offering the
	// download before they arrive would produce a CSV with rows missing.
	const canDownloadCsv = ! isLoading && !! products && !! totalPayouts && totalPayouts > 0;

	return (
		<Grid
			className="referrals-consolidated-views"
			templateColumns="repeat(auto-fit, minmax(240px, 1fr))"
			gap={ 4 }
		>
			<ConsolidatedStatCard
				value={ formatCurrency( totalPayouts ?? 0, 'USD' ) }
				footerText={
					isSingleClient ? __( 'All payouts for this client' ) : __( 'All time referral payouts' )
				}
				footerAction={
					canDownloadCsv ? (
						<Button variant="link" onClick={ handleDownloadCsv }>
							{ __( 'Download CSV' ) }
						</Button>
					) : undefined
				}
				popoverTitle={ __( 'Total payouts' ) }
				popoverContent={ createInterpolateElement(
					__(
						'The exact amount your agency has been paid out for referrals.<br/><br/><a>Learn more</a>'
					),
					{
						br: <br />,
						a: (
							<InlineSupportLink
								supportLink={ AGENCY_EARNINGS_LEARN_MORE_LINK }
								forceOpenInHelpCenter
							/>
						),
					}
				) }
				isLoading={ isLoading || isLoadingCommissionPayout }
			/>
			<PayoutCards
				isFetching={ !! isLoading }
				previousQuarterExpectedCommission={ previousQuarterExpectedCommission }
				currentQuarterExpectedCommission={ currentQuarterExpectedCommission }
				locale={ locale }
			/>
			<ConsolidatedStatCard
				value={ pendingOrders }
				footerText={ __( 'Pending referral orders' ) }
				popoverTitle={ __( 'Pending orders' ) }
				popoverContent={ createInterpolateElement(
					__(
						'These are the number of pending referrals (unpaid carts).<br/><br/><a>Learn more</a>'
					),
					{
						br: <br />,
						a: (
							<InlineSupportLink
								supportLink={ AGENCY_EARNINGS_LEARN_MORE_LINK }
								forceOpenInHelpCenter
							/>
						),
					}
				) }
				isLoading={ isLoading }
			/>
		</Grid>
	);
}
