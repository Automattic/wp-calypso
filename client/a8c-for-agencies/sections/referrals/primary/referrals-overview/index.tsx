import { pages, plugins, payment, percent } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REFERRALS_BANK_DETAILS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import StepSection from '../../common/step-section';
import StepSectionItem from '../../common/step-section-item';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';
import { getAccountStatus } from '../../lib/get-account-status';

import './style.scss';

export default function ReferralsOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Referrals' );

	const onAddBankDetailsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_add_bank_details_button_click' ) );
	}, [ dispatch ] );

	const { data, isFetching } = useGetTipaltiPayee();

	const hasPayeeAccount = data?.hasPayeeAccount || false;

	const accountStatus = getAccountStatus( data?.status, translate );

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<PageViewTracker title="Referrals" path="/referrals" />

			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="referrals-overview__section-heading">
					{ translate( 'Earn a 30% commission for every purchase made by a client' ) }
				</div>
				<div className="referrals-overview__section-container">
					{ isFetching ? (
						<>
							<TextPlaceholder />
							<TextPlaceholder />
							<TextPlaceholder />
							<TextPlaceholder />
						</>
					) : (
						<>
							<StepSection heading={ translate( 'Get set up' ) } stepCount={ 1 }>
								<StepSectionItem
									icon={ pages }
									heading={ translate( 'Add your bank details and upload tax forms' ) }
									description={ translate(
										'Once confirmed, we’ll be able to send you a commission payment at the end of each month.'
									) }
									buttonProps={ {
										children: hasPayeeAccount
											? translate( 'Edit bank details' )
											: translate( 'Add bank details' ),
										href: A4A_REFERRALS_BANK_DETAILS_LINK,
										onClick: onAddBankDetailsClick,
										primary: true,
									} }
									statusProps={
										accountStatus
											? {
													children: accountStatus?.status,
													type: accountStatus?.statusType,
											  }
											: undefined
									}
								/>
								<StepSectionItem
									icon={ plugins }
									heading={ translate( 'Install the A4A plugin on your clients’ sites' ) }
									description={ translate(
										'Our plugin can confirm that your agency is connected to the Automattic products your clients buy.'
									) }
									buttonProps={ { children: translate( 'Download plugin' ) } }
								/>
							</StepSection>
							<StepSection heading={ translate( 'Get paid' ) } stepCount={ 2 }>
								<StepSectionItem
									icon={ payment }
									heading={ translate( 'Have your client purchase Automattic Products' ) }
									description={ translate(
										'We offer commissions for each purchase of Automattic products by your clients, including Woo, Jetpack, and hosting from either Pressable or WordPress.com.'
									) }
								/>
								<StepSectionItem
									icon={ percent }
									heading={ translate( 'Get paid a commission on your referrals' ) }
									description={ translate(
										'At the end of each month, we will review your clients’ purchases and pay you a commission based on them.'
									) }
								/>
							</StepSection>
						</>
					) }
				</div>
			</LayoutBody>
		</Layout>
	);
}
