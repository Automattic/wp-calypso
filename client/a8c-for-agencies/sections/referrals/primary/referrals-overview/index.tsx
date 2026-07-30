import { referralCommissionPayoutQuery, referralsQuery } from '@automattic/api-queries';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useRef, useState, useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_MARKETPLACE_PRODUCTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	NEW_REFERRAL_ORDER_EMAIL_QUERY_PARAM_KEY,
	NEW_REFERRAL_ORDER_CHECKOUT_URL_QUERY_PARAM_KEY,
	NEW_REFERRAL_ORDER_FLOW_TYPE_QUERY_PARAM_KEY,
} from 'calypso/a8c-for-agencies/constants';
import useUrlQueryParam from 'calypso/a8c-for-agencies/hooks/use-url-query-param';
import {
	MARKETPLACE_TYPE_SESSION_STORAGE_KEY,
	MARKETPLACE_TYPE_REFERRAL,
} from 'calypso/a8c-for-agencies/sections/marketplace/hoc/with-marketplace-type';
import { DEFAULT_VIEW } from 'calypso/dashboard/agency/earn/referrals/dataviews/views';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutColumn from 'calypso/layout/hosting-dashboard/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch, useSelector } from 'calypso/state';
import {
	getActiveAgencyId,
	hasApprovedAgencyStatus,
} from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import MissingPaymentSettingsNotice from '../../common/missing-payment-settings-notice';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';
import ReferralDetails from '../../referral-details';
import { ReferralOrderFlowType } from '../../types';
import LayoutBodyContent from './layout-body-content';
import NewReferralOrderNotification from './new-referral-order-notification';
import type { View } from '@wordpress/dataviews';

import './style.scss';

export default function ReferralsOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isAgencyApproved = useSelector( hasApprovedAgencyStatus );
	const agencyId = useSelector( getActiveAgencyId ) ?? 0;

	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const [ selectedReferralId, setSelectedReferralId ] = useState< number | null >( null );

	const { value: newReferralOrderEmail, setValue: setNewReferralOrderEmail } = useUrlQueryParam(
		NEW_REFERRAL_ORDER_EMAIL_QUERY_PARAM_KEY
	);

	const { value: newReferralFlowType, setValue: setNewReferralFlowType } = useUrlQueryParam(
		NEW_REFERRAL_ORDER_FLOW_TYPE_QUERY_PARAM_KEY
	);

	const { value: newReferralOrderCheckoutUrl, setValue: setNewReferralOrderCheckoutUrl } =
		useUrlQueryParam( NEW_REFERRAL_ORDER_CHECKOUT_URL_QUERY_PARAM_KEY );

	const isDesktop = useDesktopBreakpoint();

	const { data: tipaltiData, isFetching } = useGetTipaltiPayee();
	const { data: referralCommissionPayout, isFetching: isFetchingReferralCommissionPayout } =
		useQuery( referralCommissionPayoutQuery( agencyId ) );

	const wrapperRef = useRef< HTMLButtonElement | null >( null );

	const { data: referrals, isFetching: isFetchingReferrals } = useQuery(
		referralsQuery( agencyId )
	);

	const hasReferrals = !! referrals?.length;

	// Derived from the list rather than stored, so it picks up optimistic updates.
	const selectedItem = useMemo(
		() =>
			selectedReferralId != null
				? referrals?.find( ( referral ) => referral.id === selectedReferralId )
				: undefined,
		[ selectedReferralId, referrals ]
	);

	// Spread the base view so search, sort, and pagination survive the collapse.
	const listView = useMemo< View >(
		() => ( selectedItem ? { ...view, type: 'list', titleField: 'client', fields: [] } : view ),
		[ selectedItem, view ]
	);

	// Merge the user's changes back into the base view without persisting the
	// collapsed layout overrides that `listView` applies.
	const handleChangeView = useCallback(
		( nextView: View ) => {
			setView( ( prevView ) =>
				selectedItem
					? {
							...nextView,
							type: prevView.type,
							titleField: prevView.titleField,
							fields: prevView.fields,
					  }
					: nextView
			);
		},
		[ selectedItem ]
	);

	const title =
		isDesktop && ! selectedItem
			? translate( 'Your referrals and commissions' )
			: translate( 'Referrals' );

	const makeAReferral = useCallback( () => {
		sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, MARKETPLACE_TYPE_REFERRAL );
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_make_a_referral_button_click' ) );
	}, [ dispatch ] );

	const isLoading = isFetching || isFetchingReferrals || isFetchingReferralCommissionPayout;

	return (
		<Layout
			className={ clsx( 'referrals-layout', {
				'full-width-layout-with-table': hasReferrals,
				'referrals-layout--has-selected': selectedItem,
			} ) }
			title={ title }
			wide
			withBorder
		>
			<LayoutColumn wide className="referrals-layout__column">
				<LayoutTop isFullWidth={ hasReferrals }>
					{ !! newReferralOrderEmail && (
						<NewReferralOrderNotification
							referralOrderEmail={ newReferralOrderEmail }
							referralOrderCheckoutUrl={ newReferralOrderCheckoutUrl }
							onClose={ () => {
								setNewReferralOrderEmail( '' );
								setNewReferralFlowType( '' );
								setNewReferralOrderCheckoutUrl( '' );
							} }
							isFullWidth={ hasReferrals }
							flowType={ newReferralFlowType as ReferralOrderFlowType }
						/>
					) }

					{ hasReferrals && <MissingPaymentSettingsNotice commissionType="referrals" /> }

					<LayoutHeader>
						<Title>{ title } </Title>

						<Actions>
							<MobileSidebarNavigation />
							{ isAgencyApproved && (
								<Button
									variant="primary"
									href={ A4A_MARKETPLACE_PRODUCTS_LINK }
									onClick={ makeAReferral }
									ref={ wrapperRef }
								>
									{ hasReferrals ? translate( 'New referral' ) : translate( 'Make a referral' ) }
								</Button>
							) }
						</Actions>
					</LayoutHeader>
				</LayoutTop>

				<LayoutBody>
					<LayoutBodyContent
						tipaltiData={ tipaltiData }
						referralCommissionPayout={ referralCommissionPayout }
						referrals={ referrals }
						isLoading={ isLoading }
						view={ listView }
						onChangeView={ handleChangeView }
						selectedReferral={ selectedItem ?? undefined }
						onSelectReferral={ setSelectedReferralId }
					/>
				</LayoutBody>
			</LayoutColumn>
			{ selectedItem && (
				<LayoutColumn wide>
					<ReferralDetails
						referral={ selectedItem }
						referralCommissionPayout={ referralCommissionPayout }
						closeSitePreviewPane={ () => setSelectedReferralId( null ) }
					/>
				</LayoutColumn>
			) }
		</Layout>
	);
}
