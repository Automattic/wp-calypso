import page from '@automattic/calypso-router';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function PurchaseConfirmationMessage() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const rawArg = getQueryArg( window.location.href, 'wpcom_plan_purchased' );
	const wpcomHostingPurchased = typeof rawArg === 'string' ? rawArg : '';

	const [ successNotification, setSuccessNotification ] = useState< boolean >( false );

	// Set the success notification when a WordPress.com site is purchased and remove the query arg from the URL
	useEffect( () => {
		if ( wpcomHostingPurchased ) {
			setSuccessNotification( true );
			dispatch(
				recordTracksEvent( 'calypso_a4a_client_wpcom_hosting_purchased', {
					hosting_plan: wpcomHostingPurchased,
				} )
			);
			page(
				removeQueryArgs( window.location.pathname + window.location.search, 'wpcom_plan_purchased' )
			);
		}
	}, [ dispatch, wpcomHostingPurchased ] );

	return successNotification ? (
		<LayoutBanner
			isFullWidth
			level="success"
			title={ translate( 'You’ve successfully purchased a WordPress.com site!' ) }
			onClose={ () => setSuccessNotification( false ) }
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
	) : null;
}
