import page from '@automattic/calypso-router';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import SitesDashboardContext from '../sites-dashboard-context';

export default function JetpackSiteConnected() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const jetpackConnectedSite = ( getQueryArg( window.location.href, 'site_connected' ) ??
		'' ) as string;

	const alreadyConnectedSite = ( getQueryArg( window.location.href, 'site_already_connected' ) ??
		'' ) as string;

	const [ successNotification, setSuccessNotification ] = useState< React.ReactNode >( null );
	const [ siteAlreadyConnected, setSiteAlreadyConnected ] = useState< boolean >( false );

	const { mostRecentConnectedSite, setMostRecentConnectedSite } =
		useContext( SitesDashboardContext );

	// Set the success notification when the site is connected and remove the query arg from the URL
	useEffect( () => {
		if ( jetpackConnectedSite || alreadyConnectedSite ) {
			setSuccessNotification( () =>
				jetpackConnectedSite
					? translate( '{{em}}%(jetpackConnectedSite)s{{/em}} was successfully connected', {
							args: {
								jetpackConnectedSite,
							},
							comment: '%(jetpackConnectedSite) is the site URL that was connected to Jetpack',
							components: {
								em: <em />,
							},
					  } )
					: translate( '{{em}}%(alreadyConnectedSite)s{{/em}} is already connected', {
							args: {
								alreadyConnectedSite,
							},
							comment: '%(alreadyConnectedSite) is the site URL that is connected to Jetpack',
							components: {
								em: <em />,
							},
					  } )
			);
			setMostRecentConnectedSite( jetpackConnectedSite || alreadyConnectedSite );
			setSiteAlreadyConnected( !! alreadyConnectedSite );
			page(
				jetpackConnectedSite
					? removeQueryArgs( window.location.pathname + window.location.search, 'site_connected' )
					: removeQueryArgs(
							window.location.pathname + window.location.search,
							'site_already_connected'
					  )
			);
		}
	}, [
		jetpackConnectedSite,
		alreadyConnectedSite,
		translate,
		setSuccessNotification,
		setMostRecentConnectedSite,
	] );

	// Show the success notification when the site is connected and record the event
	useEffect( () => {
		if ( successNotification ) {
			const eventName = siteAlreadyConnected
				? 'calypso_a4a_sites_jetpack_already_connected'
				: 'calypso_a4a_sites_jetpack_connected';
			dispatch( successNotice( successNotification ) );
			dispatch(
				recordTracksEvent( eventName, {
					siteUrl: mostRecentConnectedSite,
				} )
			);
		}
	}, [ dispatch, successNotification, mostRecentConnectedSite, siteAlreadyConnected ] );

	return null;
}
