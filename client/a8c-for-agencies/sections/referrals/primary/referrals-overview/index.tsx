import { Button, WooLogo } from '@automattic/components';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { plugins } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import MigrationOffer from 'calypso/a8c-for-agencies/components/a4a-migration-offer';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_REFERRALS_BANK_DETAILS_LINK,
	A4A_REFERRALS_COMMISSIONS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { A4A_DOWNLOAD_LINK_ON_GITHUB } from 'calypso/a8c-for-agencies/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import StepSection from '../../common/step-section';
import StepSectionItem from '../../common/step-section-item';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';
import { getAccountStatus } from '../../lib/get-account-status';
import tipaltiLogo from '../../lib/tipalti-logo';
import ReferralsFooter from '../footer';

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

	// Whether the user has seen the success notice in a previous session.
	const successNoticeSeen = useSelector( ( state ) =>
		getPreference( state, 'a4a-referrals-bank-details-success-notice-seen' )
	);

	// Track whether the preference has just been saved to avoid hiding the notice on the first render.
	const [ successNoticePreferenceSaved, setSuccessNoticePreferenceSaved ] = useState( false );

	// Whether the user has manually dismissed the success notice.
	const [ successNoticeDismissed, setSuccessNoticeDismissed ] = useState( successNoticeSeen );

	// Show the banking details success notice if the user has submitted their banking details and the notice has not been dismissed.
	const showBankingDetailsSuccessNotice = useMemo(
		() =>
			accountStatus?.statusType === 'success' &&
			! successNoticeDismissed &&
			( ! successNoticeSeen || successNoticePreferenceSaved ),
		[
			accountStatus?.statusType,
			successNoticeDismissed,
			successNoticePreferenceSaved,
			successNoticeSeen,
		]
	);

	// Only display the success notice for submitted banking details once.
	useEffect( () => {
		if ( accountStatus?.statusType === 'success' && ! successNoticeSeen ) {
			dispatch( savePreference( 'a4a-referrals-bank-details-success-notice-seen', true ) );
			setSuccessNoticePreferenceSaved( true );
		}
	}, [ dispatch, successNoticeSeen, accountStatus ] );

	return (
		<Layout
			className="referrals-layout"
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				{ showBankingDetailsSuccessNotice && (
					<div className="referrals-overview__section-notice">
						<NoticeBanner level="success" onClose={ () => setSuccessNoticeDismissed( true ) }>
							{ translate(
								'Thanks for entering your bank and tax information. Our team will confirm and review your submission.'
							) }
						</NoticeBanner>
					</div>
				) }
				<div className="referrals-overview__section-heading">
					{ translate( 'Recommend our products. Earn up to a 50% commission.' ) } <br />
					{ translate( ' No promo codes required.' ) }
				</div>

				<div className="referrals-overview__section-subtitle">
					<div>
						{ translate(
							'Make money on each product your clients buy from Automattic. They can buy WooCommerce extensions, tools from Jetpack, and hosting services from Pressable or WordPress.com'
						) }
					</div>
					<div>
						{ translate(
							'You can also make money when people buy things on your clients’ websites using WooPayments. {{a}}How much can I earn?{{/a}}',
							{
								components: {
									a: <a href={ A4A_REFERRALS_COMMISSIONS_LINK } />,
								},
							}
						) }
					</div>
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
							<MigrationOffer />
							<StepSection heading={ translate( 'How do I get started?' ) }>
								<StepSectionItem
									icon={ tipaltiLogo }
									heading={ translate( 'Enter your bank details so we can pay you commissions' ) }
									description={ translate(
										'Get paid seamlessly by adding your bank details and tax forms to Tipalti, our trusted and secure platform for commission payments.'
									) }
									buttonProps={ {
										children: hasPayeeAccount
											? translate( 'Edit my bank details' )
											: translate( 'Enter bank details' ),
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
									heading={ translate( 'Verify your relationship with your clients' ) }
									description={ translate(
										'Install the A4A plugin on your clients’ sites. This shows you have a direct relationship with the client.'
									) }
									buttonProps={ {
										children: translate( 'Download the plugin now' ),
										compact: true,
										href: A4A_DOWNLOAD_LINK_ON_GITHUB,
										onClick: onDownloadA4APluginClick,
									} }
								/>
								<StepSectionItem
									className="referrals-overview__step-section-woo-payments"
									icon={ <WooLogo /> }
									heading={ translate( 'Install WooPayments on your clients’ online stores' ) }
									description={
										<>
											{ translate(
												'Receive a revenue share of 5 basis points (0.05%) on new WooPayments gross merchandise value on clients’ sites.'
											) }
											<div>
												<Button
													borderless
													href="https://woocommerce.com/payments/"
													rel="noreferrer"
													target="_blank"
												>
													{ translate( 'Learn about WooPayments' ) }
												</Button>
											</div>
										</>
									}
								/>
							</StepSection>
						</>
					) }
				</div>

				{ ! isFetching && <ReferralsFooter /> }
			</LayoutBody>
		</Layout>
	);
}
