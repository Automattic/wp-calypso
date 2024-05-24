import { Button } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useFetchReferrals from '../../hooks/use-fetch-referrals';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';
import { REFER_PRODUCTS_LINK } from '../../lib/constants';
import ReferralsFooter from '../footer';
import LayoutBodyContent from './layout-body-content';

import './style.scss';

export default function ReferralsOverview( {
	isAutomatedReferral = false,
}: {
	isAutomatedReferral?: boolean;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

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
		dispatch( recordTracksEvent( 'calypso_a4a_referrals_make_a_referral_button_click' ) );
	}, [ dispatch ] );

	const isLoading = isFetching || isFetchingReferrals;

	return (
		<Layout
			className={ classNames( 'referrals-layout', {
				'referrals-layout--automated': isAutomatedReferral,
				'referrals-layout--full-width': isAutomatedReferral && ( isLoading || hasReferrals ),
			} ) }
			title={ title }
			wide
			sidebarNavigation={ ! isAutomatedReferral && <MobileSidebarNavigation /> }
			withBorder={ isAutomatedReferral }
		>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title } </Title>
					{ isAutomatedReferral && (
						<Actions>
							<MobileSidebarNavigation />
							<Button primary href={ REFER_PRODUCTS_LINK } onClick={ makeAReferral }>
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
				/>
				{ ! isFetching && ! isAutomatedReferral && <ReferralsFooter /> }
			</LayoutBody>
		</Layout>
	);
}
