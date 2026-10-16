import { useBreakpoint } from '@automattic/viewport-react';
import {
	Button,
	Notice,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import {
	A4A_CLIENT_SUBSCRIPTIONS_LINK,
	A4A_MARKETPLACE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
} from 'calypso/layout/hosting-dashboard/header';
import LayoutTop from 'calypso/layout/hosting-dashboard/top';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import usePressableReturn from './use-pressable-return';
import type { ReturnParams } from './lib';

import './style.scss';

function PressableReturnContent( params: ReturnParams ) {
	const dispatch = useDispatch();
	const { isError, retry } = usePressableReturn( params );

	if ( ! isError ) {
		return (
			<Text as="p" size={ 32 } align="center" variant="muted" role="status">
				{ __( 'Finishing the purchase and redirecting to Pressable…' ) }
			</Text>
		);
	}

	return (
		<VStack spacing={ 4 } alignment="center">
			<Notice status="error" isDismissible={ false }>
				{ __( 'We couldn’t return you to Pressable. Try again.' ) }
			</Notice>
			<Button
				__next40pxDefaultSize
				variant="primary"
				onClick={ () => {
					dispatch(
						recordTracksEvent( 'calypso_a4a_pressable_checkout_return_retry', {
							checkout_status: 'SUCCESS',
						} )
					);
					retry();
				} }
			>
				{ __( 'Try again' ) }
			</Button>
		</VStack>
	);
}

export default function PressableReturn( {
	isClient = false,
	...params
}: ReturnParams & { isClient?: boolean } ) {
	const dispatch = useDispatch();
	const isNarrowView = useBreakpoint( '<660px' );

	useEffect( () => {
		if ( isNarrowView ) {
			// The return status must stay visible instead of opening the mobile marketplace menu.
			dispatch( setLayoutFocus( 'content' ) );
		}
	}, [ dispatch, isNarrowView ] );

	return (
		<Layout
			className="pressable-return"
			title={ __( 'Checkout' ) }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						items={ [
							isClient
								? { label: __( 'Your subscriptions' ), href: A4A_CLIENT_SUBSCRIPTIONS_LINK }
								: { label: __( 'Marketplace' ), href: A4A_MARKETPLACE_LINK },
							{ label: __( 'Checkout' ) },
						] }
					/>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<PressableReturnContent { ...params } />
			</LayoutBody>
		</Layout>
	);
}
