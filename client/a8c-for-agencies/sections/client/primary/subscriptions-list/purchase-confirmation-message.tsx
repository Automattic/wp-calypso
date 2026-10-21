import page from '@automattic/calypso-router';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	CLIENT_PURCHASE_COMPLETED_QUERY_ARG,
	WPCOM_PLAN_PURCHASED_QUERY_ARG,
} from '../../lib/get-client-checkout-redirect-url';

export default function PurchaseConfirmationMessage() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const clientPurchaseCompleted =
		getQueryArg( window.location.href, CLIENT_PURCHASE_COMPLETED_QUERY_ARG ) === 'true';
	const rawArg = getQueryArg( window.location.href, WPCOM_PLAN_PURCHASED_QUERY_ARG );
	const wpcomHostingPurchased = typeof rawArg === 'string' ? rawArg : '';

	const [ confirmationType, setConfirmationType ] = useState< 'generic' | 'wpcom' | null >( null );

	useEffect( () => {
		if ( clientPurchaseCompleted || wpcomHostingPurchased ) {
			setConfirmationType( wpcomHostingPurchased ? 'wpcom' : 'generic' );
			if ( wpcomHostingPurchased ) {
				dispatch(
					recordTracksEvent( 'calypso_a4a_client_wpcom_hosting_purchased', {
						hosting_plan: wpcomHostingPurchased,
					} )
				);
			} else {
				dispatch( recordTracksEvent( 'calypso_a4a_client_purchase_confirmation_view' ) );
			}
			page(
				removeQueryArgs(
					window.location.pathname + window.location.search,
					CLIENT_PURCHASE_COMPLETED_QUERY_ARG,
					WPCOM_PLAN_PURCHASED_QUERY_ARG
				)
			);
		}
	}, [ clientPurchaseCompleted, dispatch, wpcomHostingPurchased ] );

	if ( ! confirmationType ) {
		return null;
	}

	if ( confirmationType === 'generic' ) {
		return (
			<LayoutBanner
				className="subscriptions-list__purchase-confirmation"
				isFullWidth
				level="success"
				title={ translate( 'Congratulations on your purchase!' ) }
				onClose={ () => setConfirmationType( null ) }
			>
				{ translate(
					'We’ve let your agency know, and they’ll begin setting things up for you. There’s nothing else you need to do right now.'
				) }
			</LayoutBanner>
		);
	}

	return (
		<LayoutBanner
			className="subscriptions-list__purchase-confirmation"
			isFullWidth
			level="success"
			title={ translate( 'You’ve successfully purchased a WordPress.com site!' ) }
			onClose={ () => setConfirmationType( null ) }
		>
			{ translate(
				'Once your agency creates the site, you’ll be added as an admin, and it will appear in your {{a}}site list{{/a}}.',
				{
					components: {
						a: <a href="https://wordpress.com/sites" target="_blank" rel="noreferrer" />,
					},
				}
			) }
		</LayoutBanner>
	);
}
