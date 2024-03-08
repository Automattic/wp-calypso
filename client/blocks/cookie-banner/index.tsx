import { getTrackingPrefs, setTrackingPrefs } from '@automattic/calypso-analytics';
import { CookieBanner } from '@automattic/privacy-toolset';
import cookie from 'cookie';
import { useCallback, useEffect, useState } from 'react';
import { loadTrackingScripts } from 'calypso/lib/analytics/ad-tracking/load-tracking-scripts';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	refreshCountryCodeCookieGdpr,
	shouldSeeCookieBanner,
	useDoNotSell,
} from 'calypso/lib/analytics/utils';
import { useSelector, useDispatch } from 'calypso/state';
import { bumpStat } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useCookieBannerContent } from './use-cookie-banner-content';
import type { CookieBannerProps } from '@automattic/privacy-toolset';

export const isServer = typeof document === 'undefined';
const noop = () => undefined;

const CookieBannerInner = ( { onClose }: { onClose: () => void } ) => {
	const content = useCookieBannerContent();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { setUserAdvertisingOptOut } = useDoNotSell();

	const handleAccept = useCallback< CookieBannerProps[ 'onAccept' ] >(
		( buckets ) => {
			recordTracksEvent( 'a8c_cookie_banner_ok', {
				site: document.location.host,
				path: document.location.pathname,
				essential: buckets.essential,
				analytics: buckets.analytics,
				advertising: buckets.advertising,
			} );

			setTrackingPrefs( { ok: true, buckets } );
			// If the user is logged in, update their advertising opt-out setting
			if ( isLoggedIn ) {
				setUserAdvertisingOptOut( ! buckets.advertising );
			}

			// Reload tracking scripts once the user consent changed
			loadTrackingScripts( true );

			onClose();
		},
		[ onClose ]
	);

	useEffect( () => {
		dispatch(
			bumpStat(
				'cookie-banner-view',
				'total,' + document.location.host.replace( /[^a-zA-Z0-9]/g, '-' )
			)
		);
	}, [ dispatch ] );

	useEffect( () => {
		recordTracksEvent( 'a8c_cookie_banner_view', {
			site: document.location.host,
			path: document.location.pathname,
		} );
	}, [] );

	return <CookieBanner content={ content } onAccept={ handleAccept } />;
};

const CookieBannerContainer = () => {
	const [ show, setShow ] = useState( false );

	useEffect( () => {
		const controller = new AbortController();

		refreshCountryCodeCookieGdpr( controller.signal )
			.then( () => {
				const cookies = cookie.parse( document.cookie );
				setShow( shouldSeeCookieBanner( cookies.country_code, getTrackingPrefs() ) );
			} )
			.catch( () => {
				setShow( shouldSeeCookieBanner( undefined, getTrackingPrefs() ) );
			} );

		return () => controller.abort();
	}, [ setShow ] );

	const handleClose = useCallback( () => {
		setShow( false );
	}, [ setShow ] );

	return show ? <CookieBannerInner onClose={ handleClose } /> : null;
};

export const CookieBannerContainerSSR = ( { serverShow }: { serverShow: boolean } ) => {
	if ( ! isServer ) {
		// If we already have access to browser API, we can use the regular component
		return <CookieBannerContainer />;
	}

	return serverShow ? <CookieBannerInner onClose={ noop } /> : null;
};

export default CookieBannerContainer;
