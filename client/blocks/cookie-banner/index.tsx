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

const CookieBannerInner = () => {
	const content = useCookieBannerContent();
	const dispatch = useDispatch();

	const handleAccept = useCallback< CookieBannerProps[ 'onAccept' ] >( ( buckets ) => {
		setTrackingPrefs( { ok: true, buckets } );
	}, [] );

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

export const CookieBannerContainerSSR = ( { serverShow }: { serverShow: boolean } ) =>
	serverShow ? <CookieBannerInner /> : null;

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

	return show ? <CookieBannerInner /> : null;
};

export default CookieBannerContainer;
