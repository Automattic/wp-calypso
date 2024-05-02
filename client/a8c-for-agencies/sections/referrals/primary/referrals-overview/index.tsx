import { plugins, payment, percent } from '@wordpress/icons';
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
import { A4A_DOWNLOAD_LINK_ON_GITHUB } from 'calypso/a8c-for-agencies/constants';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import StepSection from '../../common/step-section';
import StepSectionItem from '../../common/step-section-item';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';
import { getAccountStatus } from '../../lib/get-account-status';
import tipaltiLogo from '../../lib/tipalti-logo';

import './style.scss';

export default function ReferralsOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const title = translate( 'Referrals' );

	const onAddBankDetailsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_add_bank_details_button_click' ) );
	}, [ dispatch ] );

	const onDownloadA4APluginClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_download_a4a_plugin_button_click' ) );
	}, [ dispatch ] );

	const { data, isFetching } = useGetTipaltiPayee();

	const accountStatus = getAccountStatus( data, translate );

	const hasPayeeAccount = !! accountStatus?.status;

	return (
		<Layout
			className="referrals-layout"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<PageViewTracker title="Referrals" path="/referrals" />

			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<div className="referrals-overview__section-heading">
					{ translate( 'Receive up to 30% revenue share on Automattic product referrals.' ) }
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
							<StepSection
								heading={ translate( 'Set up your commission payments' ) }
								stepCount={ 1 }
							>
								<StepSectionItem
									icon={ tipaltiLogo }
									heading={ translate( 'Set up payment details in Tipalti' ) }
									description={ translate(
										'Get paid seamlessly by adding your bank details and tax forms to Tipalti, our trusted and secure platform for commission payments.'
									) }
									buttonProps={ {
										children: hasPayeeAccount
											? translate( 'Edit my bank details' )
											: translate( 'Get started with secure payments' ),
										href: A4A_REFERRALS_BANK_DETAILS_LINK,
										onClick: onAddBankDetailsClick,
										primary: ! hasPayeeAccount,
										compact: true,
									} }
									statusProps={
										accountStatus
											? {
													children: accountStatus?.status,
													type: accountStatus?.statusType,
													tooltip: accountStatus?.statusReason,
											  }
											: undefined
									}
								/>
								<StepSectionItem
									icon={ plugins }
									heading={ translate( 'Install the A4A plugin to verify your referrals' ) }
									description={ translate(
										'Install the A4A plugin on your clients’ sites to verify your referrals accurately and ensure easy tracking of Automattic product purchases.'
									) }
									buttonProps={ {
										children: translate( 'Download plugin to verify my referrals' ),
										compact: true,
										href: A4A_DOWNLOAD_LINK_ON_GITHUB,
										onClick: onDownloadA4APluginClick,
									} }
								/>
							</StepSection>
							<StepSection
								heading={ translate( 'Earn commissions from your referrals' ) }
								stepCount={ 2 }
							>
								<StepSectionItem
									icon={ payment }
									heading={ translate( 'Encourage your clients to purchase Automattic products' ) }
									description={ translate(
										'We offer commissions for each purchase of Automattic products by your clients, including Woo, Jetpack, and hosting from either Pressable or WordPress.com.'
									) }
								/>
								<StepSectionItem
									icon={ percent }
									heading={ translate( 'Receive commissions on client purchases' ) }
									description={ translate(
										'Every 60 days, we will review your clients’ purchases and pay you a commission based on them.'
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
