import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useLayoutEffect, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_REFERRALS_LINK,
	A4A_MIGRATIONS_LINK,
	A4A_WOOPAYMENTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import useGetTipaltiIFrameURL from '../../hooks/use-get-tipalti-iframe-url';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';
import { getAccountStatus } from '../../lib/get-account-status';

import './style.scss';

const getPageInfo = (
	translate: ReturnType< typeof useTranslate >,
	type?: 'migrations' | 'woopayments',
	isDesktop?: boolean
) => {
	switch ( type ) {
		case 'migrations':
			return {
				title: isDesktop
					? translate( 'Migrations: Set up secure payments' )
					: translate( 'Migrations: Payout settings' ),
				mainPageBreadCrumb: {
					label: translate( 'Migrations' ),
					href: A4A_MIGRATIONS_LINK,
				},
			};
		case 'woopayments':
			return {
				title: isDesktop
					? translate( 'WooPayments commissions: Set up secure payments' )
					: translate( 'WooPayments: Payout settings' ),
				mainPageBreadCrumb: {
					label: translate( 'WooPayments commissions' ),
					href: A4A_WOOPAYMENTS_LINK,
				},
			};
		default:
			return {
				title: isDesktop
					? translate( 'Your referrals and commissions: Set up secure payments' )
					: translate( 'Referrals: Payout settings' ),
				mainPageBreadCrumb: {
					label: isDesktop
						? translate( 'Your referrals and commissions' )
						: translate( 'Referrals' ),
					href: A4A_REFERRALS_LINK,
				},
			};
	}
};
export default function ReferralsBankDetails( { type }: { type?: 'migrations' | 'woopayments' } ) {
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();

	const [ iFrameHeight, setIFrameHeight ] = useState( '100%' );

	const { data, isFetching } = useGetTipaltiIFrameURL();
	const { data: tipaltiData } = useGetTipaltiPayee();

	const accountStatus = getAccountStatus( tipaltiData, translate );

	const iFrameSrc = data?.iframe_url || '';

	const tipaltiHandler = ( event: MessageEvent ) => {
		if ( event.data && event.data.TipaltiIframeInfo ) {
			const height = event.data.TipaltiIframeInfo?.height || '100%';
			setIFrameHeight( height );
		}
	};

	useLayoutEffect( () => {
		window.addEventListener( 'message', tipaltiHandler, false );
		return () => {
			window.removeEventListener( 'message', tipaltiHandler, false );
		};
	}, [] );

	const { title, mainPageBreadCrumb } = getPageInfo( translate, type, isDesktop );

	return (
		<Layout className="bank-details__layout" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							mainPageBreadCrumb,
							{
								label: translate( 'Set up secure payments' ),
							},
						] }
					/>
					{ accountStatus && (
						<Actions useColumnAlignment>
							<MobileSidebarNavigation />
							<div className="bank-details__status">
								{ translate( 'Payment status: {{badge}}%(status)s{{/badge}}', {
									args: {
										status: accountStatus.status,
									},
									comment: '%(status) is subscription status',
									components: {
										badge: (
											<StatusBadge
												statusProps={ {
													children: accountStatus.status,
													type: accountStatus.statusType,
													tooltip: accountStatus.statusReason,
												} }
											/>
										),
									},
								} ) }
							</div>
						</Actions>
					) }
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<>
					<div className="bank-details__heading">
						{ translate( 'Connect your bank to receive payments' ) }
					</div>
					<div className="bank-details__subheading">
						{ translate(
							'Enter your bank details to start receiving payments through {{a}}Tipalti{{/a}}↗, our secure payments platform.',
							{
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
							}
						) }
					</div>

					<div className="bank-details__iframe-container">
						{ isFetching ? (
							<TextPlaceholder />
						) : (
							<iframe width="100%" height={ iFrameHeight } src={ iFrameSrc } title={ title } />
						) }
					</div>
				</>
			</LayoutBody>
		</Layout>
	);
}
