import { Button, WooLogo } from '@automattic/components';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { plugins, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState, useEffect } from 'react';
import MigrationOffer from 'calypso/a8c-for-agencies/components/a4a-migration-offer';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import {
	A4A_REFERRALS_BANK_DETAILS_LINK,
	A4A_REFERRALS_COMMISSIONS_LINK,
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_REFERRALS_FAQ,
	A4A_MARKETPLACE_PRODUCTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { A4A_DOWNLOAD_LINK_ON_GITHUB } from 'calypso/a8c-for-agencies/constants';
import {
	MARKETPLACE_TYPE_REFERRAL,
	MARKETPLACE_TYPE_SESSION_STORAGE_KEY,
} from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-type';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WooCommerceLogo from 'calypso/components/woocommerce-logo';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import ConsolidatedViews from '../../consolidated-view';
import { getAccountStatus } from '../../lib/get-account-status';
import tipaltiLogo from '../../lib/tipalti-logo';
import ReferralList from '../../referrals-list';
import type { Referral, ReferralInvoice } from '../../types';

interface Props {
	isAutomatedReferral?: boolean;
	tipaltiData?: any;
	referrals?: Referral[];
	isLoading: boolean;
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
	referralInvoices: ReferralInvoice[];
	isFetchingInvoices: boolean;
	isArchiveView?: boolean;
	onReferralRefetch?: () => void;
}

export default function LayoutBodyContent( {
	isAutomatedReferral,
	tipaltiData,
	referrals,
	isLoading,
	dataViewsState,
	setDataViewsState,
	referralInvoices,
	isArchiveView,
	onReferralRefetch,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onAddBankDetailsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_add_bank_details_button_click' ) );
	}, [ dispatch ] );

	const onDownloadA4APluginClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_download_a4a_plugin_button_click' ) );
	}, [ dispatch ] );

	const onGetStartedClick = useCallback( () => {
		sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, MARKETPLACE_TYPE_REFERRAL );
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_get_started_button_click' ) );
	}, [ dispatch ] );

	const accountStatus = getAccountStatus( tipaltiData, translate );
	const isPayable = !! tipaltiData?.IsPayable;

	const hasPayeeAccount = !! accountStatus?.status;
	let bankAccountCTAText = hasPayeeAccount
		? translate( 'Edit my bank details' )
		: translate( 'Enter bank details' );

	if ( isAutomatedReferral ) {
		bankAccountCTAText = hasPayeeAccount
			? translate( 'Edit my details' )
			: translate( 'Add my details' );
	}

	// Track whether the preference has just been saved to avoid hiding the notice on the first render.
	const [ successNoticePreferenceSaved, setSuccessNoticePreferenceSaved ] = useState( false );

	// Whether the user has seen the success notice in a previous session.
	const successNoticeSeen = useSelector( ( state ) =>
		getPreference( state, 'a4a-referrals-bank-details-success-notice-seen' )
	);

	// Only display the success notice for submitted banking details once.
	useEffect( () => {
		if ( accountStatus?.statusType === 'success' && ! successNoticeSeen ) {
			dispatch( savePreference( 'a4a-referrals-bank-details-success-notice-seen', true ) );
			setSuccessNoticePreferenceSaved( true );
		}
	}, [ dispatch, successNoticeSeen, accountStatus ] );

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

	if ( isAutomatedReferral && referrals?.length ) {
		return (
			<>
				{ ! dataViewsState.selectedItem && ! isArchiveView && (
					<ConsolidatedViews
						referrals={ referrals }
						totalPayouts={ tipaltiData?.PaymentsStatus?.submittedTotal }
					/>
				) }
				<ReferralList
					referrals={ referrals }
					referralInvoices={ referralInvoices }
					dataViewsState={ dataViewsState }
					setDataViewsState={ setDataViewsState }
					isArchiveView={ isArchiveView }
					onArchiveReferral={ () => onReferralRefetch?.() }
				/>
			</>
		);
	}

	return (
		<>
			{ showBankingDetailsSuccessNotice && (
				<div className="referrals-overview__section-notice">
					<NoticeBanner level="success" onClose={ () => setSuccessNoticeDismissed( true ) }>
						{ translate(
							'Thanks for entering your bank and tax information. Our team will confirm and review your submission.'
						) }
					</NoticeBanner>
				</div>
			) }
			{ isAutomatedReferral && (
				<div className="referrals-overview__section-icons">
					<JetpackLogo className="jetpack-logo" size={ 24 } />
					<WooCommerceLogo className="woocommerce-logo" size={ 40 } />
					<img className="pressable-icon" src={ pressableIcon } alt="Pressable" />
					<WordPressLogo className="a4a-overview-hosting__wp-logo" size={ 24 } />
				</div>
			) }
			<div className="referrals-overview__section-heading">
				{ isAutomatedReferral ? (
					<>
						{ translate( 'Recommend our products.' ) } <br />
						{ translate( 'Earn up to a 50% commission.' ) }
					</>
				) : (
					<>
						{ translate( 'Recommend our products. Earn up to a 50% commission.' ) } <br />
						{ translate( ' No promo codes required.' ) }
					</>
				) }
			</div>

			<div className="referrals-overview__section-subtitle">
				{ isAutomatedReferral ? (
					translate(
						'Make money when your clients buy Automattic products, hosting, or use WooPayments. No promo codes{{nbsp/}}needed.',
						{
							components: {
								nbsp: <>&nbsp;</>,
							},
						}
					)
				) : (
					<>
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
					</>
				) }
			</div>
			<div className="referrals-overview__section-container">
				{ isLoading ? (
					<>
						<TextPlaceholder />
						<TextPlaceholder />
						<TextPlaceholder />
						<TextPlaceholder />
					</>
				) : (
					<>
						{ ! isAutomatedReferral && <MigrationOffer /> }
						<StepSection
							heading={
								isAutomatedReferral
									? translate( 'How do I start?' )
									: translate( 'How do I get started?' )
							}
						>
							<StepSectionItem
								isNewLayout={ isAutomatedReferral }
								icon={ tipaltiLogo }
								heading={
									isAutomatedReferral
										? translate( 'Prepare to get paid' )
										: translate( 'Enter your bank details so we can pay you commissions' )
								}
								description={
									isAutomatedReferral
										? translate( 'With {{a}}Tipalti{{/a}}↗, our secure platform.', {
												components: {
													a: (
														<a
															className="referrals-overview__link"
															href="https://tipalti.com/"
															target="_blank"
															rel="noopener noreferrer"
														/>
													),
												},
										  } )
										: translate(
												'Get paid seamlessly by adding your bank details and tax forms to Tipalti, our trusted and secure platform for commission payments.'
										  )
								}
								buttonProps={ {
									children: bankAccountCTAText,
									href: isAutomatedReferral
										? A4A_REFERRALS_PAYMENT_SETTINGS
										: A4A_REFERRALS_BANK_DETAILS_LINK,
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
							{ isAutomatedReferral ? (
								<StepSectionItem
									iconClassName="referrals-overview__opacity-70-percent"
									isNewLayout
									icon={ reusableBlock }
									heading={ translate( 'Refer products and hosting' ) }
									description={ translate( 'Receive up to a 50% commission.' ) }
									buttonProps={ {
										children: translate( 'Get started' ),
										compact: true,
										primary: hasPayeeAccount,
										disabled: ! isPayable,
										href: A4A_MARKETPLACE_PRODUCTS_LINK,
										onClick: onGetStartedClick,
									} }
								/>
							) : (
								<StepSectionItem
									iconClassName="referrals-overview__opacity-70-percent"
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
							) }
							<StepSectionItem
								isNewLayout={ isAutomatedReferral }
								className="referrals-overview__step-section-woo-payments"
								icon={ <WooLogo /> }
								heading={
									isAutomatedReferral
										? translate( 'Install WooPayments' )
										: translate( 'Install WooPayments on your clients’ online stores' )
								}
								description={
									isAutomatedReferral ? (
										<>
											{ translate(
												'Receive a revenue share of 5 basis points on the total payments{{nbsp/}}volume.',
												{
													components: {
														nbsp: <>&nbsp;</>,
													},
												}
											) }
										</>
									) : (
										translate(
											'Receive a revenue share of 5 basis points (0.05%) on new WooPayments total payments volume (TPV) on clients’ sites.'
										)
									)
								}
								buttonProps={ {
									children: isAutomatedReferral
										? translate( 'Learn how' )
										: translate( 'Learn about WooPayments' ),
									compact: isAutomatedReferral,
									primary: isAutomatedReferral && hasPayeeAccount,
									borderless: ! isAutomatedReferral,
									href: 'https://woocommerce.com/payments/',
									rel: 'noreferrer',
									target: '_blank',
								} }
							/>
						</StepSection>
						{ isAutomatedReferral && (
							<StepSection
								className="referrals-overview__step-section-learn-more"
								heading={ translate( 'Find out more' ) }
							>
								<Button className="a8c-blue-link" borderless href={ A4A_REFERRALS_FAQ }>
									{ translate( 'How much money will I make?' ) }
								</Button>
							</StepSection>
						) }
					</>
				) }
			</div>
		</>
	);
}
