import page from '@automattic/calypso-router';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import SitesOverviewContext from '../context';

export default function JetpackSiteConnected() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const jetpackConnectedSite = ( getQueryArg( window.location.href, 'site_connected' ) ??
		'' ) as string;
	const [ successNotification, setSuccessNotification ] = useState< React.ReactNode >( null );
	const { setMostRecentConnectedSite } = useContext( SitesOverviewContext );
	// Set the success notification when the site is connected and remove the query arg from the URL
	useEffect( () => {
		if ( jetpackConnectedSite ) {
			setSuccessNotification( () =>
				translate( '{{em}}%(jetpackConnectedSite)s{{/em}} was successfully connected to Jetpack', {
					args: {
						jetpackConnectedSite,
					},
					comment: '%(jetpackConnectedSite) is the site URL that was connected to Jetpack',
					components: {
						em: <em />,
					},
				} )
			);
			setMostRecentConnectedSite( jetpackConnectedSite );
			page.redirect(
				removeQueryArgs( window.location.pathname + window.location.search, 'site_connected' )
			);
		}
	}, [ jetpackConnectedSite, translate, setSuccessNotification, setMostRecentConnectedSite ] );

	// Show the success notification when the site is connected and record the event
	useEffect( () => {
		if ( successNotification ) {
			dispatch( successNotice( successNotification ) );
			dispatch(
				recordTracksEvent( 'calypso_jetpack_complete_page_open', {
					siteUrl: jetpackConnectedSite,
				} )
			);
		}
	}, [ dispatch, jetpackConnectedSite, successNotification ] );

	return null;
}
