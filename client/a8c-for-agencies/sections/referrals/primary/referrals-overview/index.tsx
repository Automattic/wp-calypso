import { Button } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import {
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import Layout from 'calypso/a8c-for-agencies/components/layout';
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
import useFetchReferrals from '../../hooks/use-fetch-referrals';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';
import ReferralDetails from '../../referral-details';
import ReferralsFooter from '../footer';
import LayoutBodyContent from './layout-body-content';
import NewRefferalOrderNotification from './new-referral-order-notification';

import './style.scss';

export default function ReferralsOverview( {
	isAutomatedReferral = false,
}: {
	isAutomatedReferral?: boolean;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );

	const { value: referralEmail, setValue: setReferralEmail } = useUrlQueryParam(
		REFERRAL_EMAIL_QUERY_PARAM_KEY
	);

	const isDesktop = useDesktopBreakpoint();

	const title =
		isAutomatedReferral && isDesktop
			? translate( 'Your referrals and commissions' )
			: translate( 'Referrals' );

	const { data: tipaltiData, isFetching } = useGetTipaltiPayee();
	const { data: referrals, isFetching: isFetchingReferrals } =
		useFetchReferrals( isAutomatedReferral );

	const hasReferrals = !! referrals?.length;

	const makeAReferral = useCallback( () => {
		sessionStorage.setItem( MARKETPLACE_TYPE_SESSION_STORAGE_KEY, MARKETPLACE_TYPE_REFERRAL );
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_make_a_referral_button_click' ) );
	}, [ dispatch ] );

	const isLoading = isFetching || isFetchingReferrals;

	const selectedItem = dataViewsState.selectedItem;

	return (
		<Layout
			className={ clsx( 'referrals-layout', {
				'referrals-layout--automated': isAutomatedReferral,
				'referrals-layout--full-width': isAutomatedReferral && hasReferrals,
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
						<NewRefferalOrderNotification
							email={ referralEmail }
							onClose={ () => setReferralEmail( '' ) }
						/>
					) }

					<LayoutHeader>
						<Title>{ title } </Title>
						{ isAutomatedReferral && (
							<Actions>
								<MobileSidebarNavigation />
								<Button primary href={ A4A_MARKETPLACE_PRODUCTS_LINK } onClick={ makeAReferral }>
									{ hasReferrals ? translate( 'New referral' ) : translate( 'Make a referral' ) }
								</Button>
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
					/>
					{ ! isFetching && ! isAutomatedReferral && <ReferralsFooter /> }
				</LayoutBody>
			</LayoutColumn>
			{ dataViewsState.selectedItem && (
				<LayoutColumn wide>
					<ReferralDetails
						referral={ dataViewsState.selectedItem }
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
