import { Button, WooLogo } from '@automattic/components';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { reusableBlock } from '@wordpress/icons';
import { numberFormat, useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import {
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_REFERRALS_FAQ,
	A4A_MARKETPLACE_PRODUCTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import {
	MARKETPLACE_TYPE_REFERRAL,
	MARKETPLACE_TYPE_SESSION_STORAGE_KEY,
} from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-type';
import WooLogoColor from 'calypso/assets/images/icons/Woo_logo_color.svg';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import ConsolidatedViews from '../../consolidated-view';
import { getAccountStatus } from '../../lib/get-account-status';
import tipaltiLogo from '../../lib/tipalti-logo';
import ReferralList from '../../referrals-list';
import type { Referral } from '../../types';

interface Props {
	tipaltiData?: any;
	referrals?: Referral[];
	isLoading: boolean;
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
	isArchiveView?: boolean;
	onReferralRefetch?: () => void;
}

export default function LayoutBodyContent( {
	tipaltiData,
	referrals,
	isLoading,
	dataViewsState,
	setDataViewsState,
	isArchiveView,
	onReferralRefetch,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onAddBankDetailsClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_add_bank_details_button_click' ) );
	}, [ dispatch ] );

	const onGetStartedClick = useCallback( () => {
		sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, MARKETPLACE_TYPE_REFERRAL );
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_get_started_button_click' ) );
	}, [ dispatch ] );

	const accountStatus = getAccountStatus( tipaltiData, translate );
	const isPayable = !! tipaltiData?.IsPayable;

	const hasPayeeAccount = !! accountStatus?.status;
	const bankAccountCTAText = hasPayeeAccount
		? translate( 'Edit my details' )
		: translate( 'Add my details' );

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

	if ( referrals?.length ) {
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
			<div className="referrals-overview__section-icons">
				<JetpackLogo className="jetpack-logo" size={ 24 } />
				<img width={ 45 } src={ WooLogoColor } alt="WooCommerce" />
				<img className="pressable-icon" src={ pressableIcon } alt="Pressable" />
				<WordPressLogo className="a4a-overview-hosting__wp-logo" size={ 24 } />
			</div>
			<div className="referrals-overview__section-heading">
				{ translate( 'Recommend our products.' ) } <br />
				{ translate( 'Earn up to a %(commissionPercent)s commission.', {
					args: {
						commissionPercent: numberFormat( 0.5, {
							numberFormatOptions: { style: 'percent' },
						} ),
					},
				} ) }
			</div>

			<div className="referrals-overview__section-subtitle">
				{ translate(
					'Make money when your clients buy Automattic products, hosting, or use WooPayments. No promo codes{{nbsp/}}needed.',
					{
						components: {
							nbsp: <>&nbsp;</>,
						},
					}
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
						<StepSection heading={ translate( 'How do I start?' ) }>
							<StepSectionItem
								icon={ tipaltiLogo }
								heading={ translate( 'Prepare to get paid' ) }
								description={ translate( 'With {{a}}Tipalti{{/a}}↗, our secure platform.', {
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
								} ) }
								buttonProps={ {
									children: bankAccountCTAText,
									href: A4A_REFERRALS_PAYMENT_SETTINGS,
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
								iconClassName="referrals-overview__opacity-70-percent"
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
							<StepSectionItem
								className="referrals-overview__step-section-woo-payments"
								icon={ <WooLogo /> }
								heading={ translate( 'Install WooPayments' ) }
								description={ translate(
									'Receive a revenue share of 5 basis points on the total payments{{nbsp/}}volume.',
									{
										components: {
											nbsp: <>&nbsp;</>,
										},
									}
								) }
								buttonProps={ {
									children: translate( 'Learn how' ),
									compact: true,
									primary: hasPayeeAccount,
									href: 'https://woocommerce.com/payments/',
									rel: 'noreferrer',
									target: '_blank',
								} }
							/>
						</StepSection>
						<StepSection
							className="referrals-overview__step-section-learn-more"
							heading={ translate( 'Find out more' ) }
						>
							<Button className="a8c-blue-link" borderless href={ A4A_REFERRALS_FAQ }>
								{ translate( 'How much money will I make?' ) }
							</Button>
						</StepSection>
					</>
				) }
			</div>
		</>
	);
}
