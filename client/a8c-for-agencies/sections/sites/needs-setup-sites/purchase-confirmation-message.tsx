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

	const wpcomHostingPurchased = ( getQueryArg( window.location.href, 'wpcom_creator_purchased' ) ??
		'' ) as string;

	const [ successNotification, setSuccessNotification ] = useState< boolean >( false );

	// Set the success notification when a WPCOM hosting plan is purchased and remove the query arg from the URL
	useEffect( () => {
		if ( wpcomHostingPurchased ) {
			setSuccessNotification( true );
			dispatch(
				recordTracksEvent( 'calypso_a4a_wpcom_hosting_purchased', {
					hosting_plan: wpcomHostingPurchased,
				} )
			);
			page(
				removeQueryArgs(
					window.location.pathname + window.location.search,
					'wpcom_creator_purchased'
				)
			);
		}
	}, [ dispatch, wpcomHostingPurchased ] );

	return successNotification ? (
		<LayoutBanner
			isFullWidth
			level="success"
			title={ translate( 'Congratulations on your WordPress.com purchase!' ) }
			onClose={ () => setSuccessNotification( false ) }
		>
			{ translate(
				'Set up your sites as you need them, in the “Needs setup” tab within the sites dashboard. Once set up, you can access each site under the “All” tab.'
			) }
		</LayoutBanner>
	) : null;
}
