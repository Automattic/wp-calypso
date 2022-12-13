import { CookieBanner } from '@automattic/privacy-toolset';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
	setTrackingPrefs,
	shouldSeeCookieBanner,
	getTrackingPrefs,
	useRefreshGeoCookies,
} from 'calypso/lib/analytics/utils';
import { bumpStat } from 'calypso/state/analytics/actions';
import { useCookieBannerContent } from './use-cookie-banner-content';
import type { CookieBannerProps } from '@automattic/privacy-toolset';

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
	const geoCookies = useRefreshGeoCookies();

	useEffect( () => {
		if ( geoCookies ) {
			setShow( shouldSeeCookieBanner( geoCookies.countryCode, getTrackingPrefs() ) );
		}
	}, [ geoCookies ] );

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
