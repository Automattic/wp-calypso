import {
	activeAgencyQuery,
	referralsQuery,
	referralCommissionPayoutQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useLocale } from '../../../app/locale';
import { DataViewsCard } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import RouterLinkButton from '../../../components/router-link-button';
import ConsolidatedViews from './consolidated-views';
import { DEFAULT_VIEW } from './dataviews/views';
import ReferralsEmptyState from './empty-state';
import MissingPaymentSettingsNotice from './missing-payment-settings-notice';
import ReferralsList from './referrals-list';
import type { View } from '@wordpress/dataviews';

export default function EarnReferrals() {
	const locale = useLocale();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: referrals = [], isLoading: isLoadingReferrals } = useQuery(
		referralsQuery( agencyId )
	);
	const { data: commissionPayout, isLoading: isLoadingCommissionPayout } = useQuery(
		referralCommissionPayoutQuery( agencyId )
	);

	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	// Counts the pre-agency window as loading, so the empty state doesn't flash.
	const isLoading = agency === undefined || isLoadingReferrals;
	const hasReferrals = referrals.length > 0;

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Referrals' ) }
					description={ __( 'Refer products and services and earn commissions.' ) }
					actions={
						hasReferrals ? (
							<RouterLinkButton variant="primary" to="/marketplace/exclusive-offers">
								{ __( 'New referral' ) }
							</RouterLinkButton>
						) : undefined
					}
				/>
			}
			notices={ <MissingPaymentSettingsNotice hasReferrals={ hasReferrals } /> }
		>
			{ ! isLoading && ! hasReferrals ? (
				<ReferralsEmptyState agencyId={ agencyId } />
			) : (
				<>
					<ConsolidatedViews
						referrals={ referrals }
						referralCommissionPayout={ commissionPayout }
						isLoading={ isLoading }
						isLoadingCommissionPayout={ isLoadingCommissionPayout }
						locale={ locale }
					/>
					<DataViewsCard>
						<ReferralsList
							referrals={ referrals }
							view={ view }
							onChangeView={ setView }
							isLoading={ isLoading }
							renderClient={ ( item ) => (
								<Link
									to="/earn/referrals/$referralId"
									params={ { referralId: String( item.id ) } }
									style={ { color: 'inherit', textDecoration: 'none' } }
								>
									{ item.client.email }
								</Link>
							) }
						/>
					</DataViewsCard>
				</>
			) }
		</PageLayout>
	);
}
