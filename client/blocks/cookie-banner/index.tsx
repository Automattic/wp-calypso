import { CookieBanner, CookieBannerProps } from '@automattic/privacy-toolset';
import cookie from 'cookie';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	refreshCountryCodeCookieGdpr,
	setTrackingPrefs,
	shouldSeeCookieBanner,
	getTrackingPrefs,
} from 'calypso/lib/analytics/utils';
import { bumpStat } from 'calypso/state/analytics/actions';
import { useCookieBannerContent } from './use-cookie-banner-content';

export const isServer = typeof document === 'undefined';
const noop = () => undefined;

const CookieBannerInner = ( { onClose }: { onClose: () => void } ) => {
	const content = useCookieBannerContent();
	const dispatch = useDispatch();

	const handleAccept = useCallback< CookieBannerProps[ 'onAccept' ] >(
		( buckets ) => {
			setTrackingPrefs( { ok: true, buckets } );
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

	return <CookieBanner content={ content } onAccept={ handleAccept } />;
};

const CookieBannerContainer = () => {
	const [ show, setShow ] = useState( false );

	useEffect( () => {
		refreshCountryCodeCookieGdpr().then( () => {
			const cookies = cookie.parse( document.cookie );
			setShow(
				shouldSeeCookieBanner( cookies.country_code, cookies.region, getTrackingPrefs() ) ?? false
			);
		} );
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
