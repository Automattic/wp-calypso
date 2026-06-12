import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useEffect, useState } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { EXTERNAL_PRESSABLE_AUTH_URL } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function PressablePurchaseConfirmationMessage() {
	const dispatch = useDispatch();

	const pressablePurchased = ( getQueryArg( window.location.href, 'pressable_purchased' ) ??
		'' ) as string;

	const [ successNotification, setSuccessNotification ] = useState< boolean >( false );

	// Show the confirmation banner when a Pressable plan is purchased and remove the query arg from the URL.
	useEffect( () => {
		if ( pressablePurchased ) {
			setSuccessNotification( true );
			dispatch(
				recordTracksEvent( 'calypso_a4a_pressable_plan_purchased', {
					pressable_plan: pressablePurchased,
				} )
			);
			page(
				removeQueryArgs( window.location.pathname + window.location.search, 'pressable_purchased' )
			);
		}
	}, [ dispatch, pressablePurchased ] );

	const onExploreDashboardClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_pressable_plan_purchased_explore_dashboard_click' ) );
	};

	return successNotification ? (
		<LayoutBanner
			isFullWidth
			level="success"
			title={ __( 'Congratulations! Your Pressable plan is ready!' ) }
			onClose={ () => setSuccessNotification( false ) }
			actions={ [
				<Button
					key="explore-pressable-dashboard"
					variant="primary"
					href={ EXTERNAL_PRESSABLE_AUTH_URL }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ onExploreDashboardClick }
				>
					{ __( 'Explore your Pressable dashboard' ) }
				</Button>,
			] }
		>
			{ __(
				'The next step is adding or migrating a site. It only takes a few minutes, and our support team is always here if you need a hand.'
			) }
		</LayoutBanner>
	) : null;
}
