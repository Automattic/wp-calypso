import { Button } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import A4APopover from 'calypso/a8c-for-agencies/components/a4a-popover';
import {
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { REFERRAL_EMAIL_QUERY_PARAM_KEY } from 'calypso/a8c-for-agencies/constants';
import useUrlQueryParam from 'calypso/a8c-for-agencies/hooks/use-url-query-param';
import {
	MARKETPLACE_TYPE_SESSION_STORAGE_KEY,
	MARKETPLACE_TYPE_REFERRAL,
} from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-type';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useFetchReferralInvoices from '../../hooks/use-fetch-referral-invoices';
import useFetchReferrals from '../../hooks/use-fetch-referrals';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';
import { getAccountStatus } from '../../lib/get-account-status';
import ReferralDetails from '../../referral-details';
import ReferralsFooter from '../footer';
import AutomatedReferralComingSoonBanner from './automated-referral-coming-soon-banner';
import LayoutBodyContent from './layout-body-content';
import NewReferralOrderNotification from './new-referral-order-notification';

import './style.scss';

export default function ReferralsOverview( {
	isAutomatedReferral = false,
}: {
	isAutomatedReferral?: boolean;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );
	const [ requiredNoticeClose, setRequiredNoticeClosed ] = useState( false );

	const { value: referralEmail, setValue: setReferralEmail } = useUrlQueryParam(
		REFERRAL_EMAIL_QUERY_PARAM_KEY
	);

	const isDesktop = useDesktopBreakpoint();

	const selectedItem = dataViewsState.selectedItem;

	const title =
		isAutomatedReferral && isDesktop && ! selectedItem
			? translate( 'Your referrals and commissions' )
			: translate( 'Referrals' );

	const { data: tipaltiData, isFetching } = useGetTipaltiPayee();
	const accountStatus = getAccountStatus( tipaltiData, translate );

	const isPayable = !! tipaltiData?.IsPayable;
	const [ showPopover, setShowPopover ] = useState( false );
	const wrapperRef = useRef< HTMLButtonElement | null >( null );

	const { data: referrals, isFetching: isFetchingReferrals } =
		useFetchReferrals( isAutomatedReferral );

	const { data: referralInvoices, isFetching: isFetchingReferralInvoices } =
		useFetchReferralInvoices( isAutomatedReferral );

	const hasReferrals = !! referrals?.length;

	const actionRequiredNotice =
		hasReferrals && accountStatus?.actionRequired && ! requiredNoticeClose;

	const makeAReferral = useCallback( () => {
		sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, MARKETPLACE_TYPE_REFERRAL );
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_make_a_referral_button_click' ) );
	}, [ dispatch ] );

	const isLoading = isFetching || isFetchingReferrals;

	return (
		<Layout
			className={ clsx( 'referrals-layout', {
				'referrals-layout--automated': isAutomatedReferral,
				'full-width-layout-with-table': isAutomatedReferral && hasReferrals,
				'referrals-layout--has-selected': selectedItem,
			} ) }
			title={ title }
			wide
			sidebarNavigation={ ! isAutomatedReferral && <MobileSidebarNavigation /> }
			withBorder={ isAutomatedReferral }
		>
			<LayoutColumn wide className="referrals-layout__column">
				<LayoutTop>
					{ !! referralEmail && (
						<NewReferralOrderNotification
							email={ referralEmail }
							onClose={ () => setReferralEmail( '' ) }
						/>
					) }
					{ actionRequiredNotice && (
						<div className="referrals-overview__notice">
							<LayoutBanner
								level="warning"
								title={ translate( 'Your payment settings require action' ) }
								onClose={ () => setRequiredNoticeClosed( true ) }
							>
								<div>
									{ translate(
										'Please confirm your details before referring products to your clients.'
									) }
								</div>
								<Button
									className="referrals-overview__notice-button"
									href="/referrals/payment-settings"
								>
									{ translate( 'Go to payment settings' ) }
								</Button>
							</LayoutBanner>
						</div>
					) }

					{ ! isAutomatedReferral && <AutomatedReferralComingSoonBanner /> }

					<LayoutHeader>
						<Title>{ title } </Title>
						{ isAutomatedReferral && (
							<Actions>
								<MobileSidebarNavigation />
								<span
									onMouseEnter={ () => {
										! isPayable && setShowPopover( true );
									} }
								>
									<Button
										primary
										href={ A4A_MARKETPLACE_PRODUCTS_LINK }
										onClick={ makeAReferral }
										disabled={ ! isPayable }
										ref={ wrapperRef }
									>
										{ hasReferrals ? translate( 'New referral' ) : translate( 'Make a referral' ) }
									</Button>
									{ showPopover && (
										<A4APopover
											className="referrals-overview__button-popover"
											title={ translate( 'Your payment settings require action' ) }
											offset={ 12 }
											position="bottom left"
											wrapperRef={ wrapperRef }
											onFocusOutside={ () => setShowPopover( false ) }
										>
											<div className="referrals-overview__button-popover-description">
												{ translate(
													'Please confirm your details before referring products to your clients.'
												) }
											</div>
											<Button
												className="referrals-overview__notice-button"
												href="/referrals/payment-settings"
											>
												{ translate( 'Go to payment settings' ) }
											</Button>
										</A4APopover>
									) }
								</span>
							</Actions>
						) }
					</LayoutHeader>
				</LayoutTop>

				<LayoutBody>
					<LayoutBodyContent
						isAutomatedReferral={ isAutomatedReferral }
						tipaltiData={ tipaltiData }
						referrals={ referrals }
						isLoading={ isLoading }
						dataViewsState={ dataViewsState }
						setDataViewsState={ setDataViewsState }
						referralInvoices={ referralInvoices ?? [] }
						isFetchingInvoices={ isFetchingReferralInvoices }
					/>
					{ ! isFetching && ! isAutomatedReferral && <ReferralsFooter /> }
				</LayoutBody>
			</LayoutColumn>
			{ dataViewsState.selectedItem && (
				<LayoutColumn wide>
					<ReferralDetails
						referral={ dataViewsState.selectedItem }
						referralInvoices={ referralInvoices ?? [] }
						closeSitePreviewPane={ () =>
							setDataViewsState( {
								...dataViewsState,
								type: DATAVIEWS_TABLE,
								selectedItem: undefined,
							} )
						}
					/>
				</LayoutColumn>
			) }
		</Layout>
	);
}
