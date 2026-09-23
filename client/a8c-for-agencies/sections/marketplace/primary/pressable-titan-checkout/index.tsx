import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import usePreparePressableTitanCheckoutMutation from 'calypso/a8c-for-agencies/data/marketplace/use-prepare-pressable-titan-checkout';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, { LayoutHeaderTitle as Title } from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ClientCheckoutError from '../../billing-dragon-checkout/checkout-error';
import ClientCheckoutPlaceholder from '../../billing-dragon-checkout/checkout-placeholder';
import { getPressableTitanCheckoutQueryArgs } from '../../lib/get-pressable-titan-checkout-query-args';

/**
 * Landing page for Pressable's signed Titan inbox checkout redirect (A4A-3265).
 *
 * Pressable sends the agency owner here with signed params. This page forwards
 * them verbatim to WPCOM, which verifies the signature, checks ownership and
 * prepares the cart, then sends the browser on to the normal A4A checkout.
 * No cart or pricing logic lives here.
 */
export default function PressableTitanCheckout() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const params = useMemo( () => getPressableTitanCheckoutQueryArgs(), [] );
	const { mutate, status, data, error } = usePreparePressableTitanCheckoutMutation();

	useEffect( () => {
		if ( params ) {
			mutate( params );
		}
		// Prepare exactly once per page load; the params come from the URL and do not change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	useEffect( () => {
		if ( status === 'success' ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_pressable_titan_checkout_prepared', {
					agency_id: params?.agency_id,
					domain: params?.domain,
					quantity: params?.quantity,
				} )
			);
			window.location.replace( data.checkout_url );
		} else if ( status === 'error' ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_marketplace_pressable_titan_checkout_failed', {
					agency_id: params?.agency_id,
					domain: params?.domain,
					error_code: error.code,
				} )
			);
		}
	}, [ status, data, error, dispatch, params ] );

	const title = translate( 'Titan inbox checkout' );

	let content;
	if ( ! params ) {
		content = (
			<ClientCheckoutError
				title={ translate( 'This checkout link is incomplete.' ) }
				message={ translate( 'Please return to Pressable and start the inbox purchase again.' ) }
			/>
		);
	} else if ( status === 'error' ) {
		content = (
			<ClientCheckoutError
				title={ translate( 'We could not prepare this checkout.' ) }
				message={ error.message }
			/>
		);
	} else {
		content = <ClientCheckoutPlaceholder />;
	}

	return (
		<Layout title={ title } wide sidebarNavigation={ <MobileSidebarNavigation /> }>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>{ content }</LayoutBody>
		</Layout>
	);
}
