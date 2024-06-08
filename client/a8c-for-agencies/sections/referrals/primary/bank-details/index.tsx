import { useDesktopBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLayoutEffect, useState } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutBody from 'calypso/a8c-for-agencies/components/layout/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_REFERRALS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useGetTipaltiIFrameURL from '../../hooks/use-get-tipalti-iframe-url';

import './style.scss';

export default function ReferralsBankDetails( {
	isAutomatedReferral = false,
}: {
	isAutomatedReferral?: boolean;
} ) {
	const translate = useTranslate();
	const isDesktop = useDesktopBreakpoint();

	const [ iFrameHeight, setIFrameHeight ] = useState( '100%' );

	const automatedReferralTitle = isDesktop
		? translate( 'Your referrals and commissions: Set up secure payments' )
		: translate( 'Payment Settings' );

	const title = isAutomatedReferral
		? automatedReferralTitle
		: translate( 'Referrals: Add bank details' );

	const { data, isFetching } = useGetTipaltiIFrameURL();

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

	return (
		<Layout
			className={ clsx( 'bank-details__layout', {
				'bank-details__layout--automated': isAutomatedReferral,
			} ) }
			title={ title }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							{
								label:
									isAutomatedReferral && isDesktop
										? translate( 'Your referrals and commissions' )
										: translate( 'Referrals' ),
								href: A4A_REFERRALS_LINK,
							},
							{
								label: isAutomatedReferral
									? translate( 'Set up secure payments' )
									: translate( 'Add bank details' ),
							},
						] }
					/>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				<>
					{ isAutomatedReferral && (
						<>
							<div className="bank-details__heading">
								{ translate( 'Connect your bank to receive payments' ) }
							</div>
							<div className="bank-details__subheading">
								{ translate(
									'Enter your bank details to start receiving payments through {{a}}Tipalti ↗{{/a}}, our secure payments platform.',
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
						</>
					) }
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
