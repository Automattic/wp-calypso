import { Button, Card } from '@automattic/components';
import classNames from 'classnames';
import cookie from 'cookie';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refreshCountryCodeCookieGdpr, shouldSeeGdprBanner } from 'calypso/lib/analytics/utils';
import { preventWidows } from 'calypso/lib/formatting';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60;
const STATUS = {
	VISIBLE: 'visible',
	HIDDEN: 'hidden',
	HIDING: 'hiding', // Only used when the user clicks to accept.
};

const isServer = typeof document === 'undefined';

function getGdprFromCookies() {
	const cookies = cookie.parse( document.cookie );
	return {
		country: cookies.country_code,
		pixel: cookies.sensitive_pixel_option,
	};
}

const useShowGdprBanner = isServer
	? ( serverShow ) => serverShow
	: () => {
			const [ { country, pixel }, setState ] = useState( getGdprFromCookies );

			// If the country is unknown, try to determine it and then read status from cookies again.
			// If the refresh request fails, it will set the `country_code` cookie to `unknown`.
			useEffect( () => {
				if ( ! country ) {
					refreshCountryCodeCookieGdpr().then( () => setState( getGdprFromCookies ) );
				}
			}, [ country ] );

			return shouldSeeGdprBanner( country, pixel );
	  };

export default function GdprBanner( { showGdprBanner = false } ) {
	const show = useShowGdprBanner( showGdprBanner );

	// null value means that it hasn't been determined yet. Don't render the banner yet.
	if ( show == null ) {
		return null;
	}

	return <GdprBannerInner show={ show } />;
}

function GdprBannerInner( { show } ) {
	const [ bannerStatus, setBannerStatus ] = useState( show ? STATUS.VISIBLE : STATUS.HIDDEN );
	const dispatch = useDispatch();
	const translate = useTranslate();

	const acknowledgeClicked = () => {
		document.cookie = cookie.serialize( 'sensitive_pixel_option', 'yes', {
			path: '/',
			maxAge: SIX_MONTHS,
		} );
		dispatch( recordTracksEvent( 'a8c_cookie_banner_ok', { site: 'Calypso' } ) );
		setBannerStatus( STATUS.HIDING );
	};

	useEffect( () => {
		bannerStatus === STATUS.VISIBLE &&
			dispatch(
				bumpStat(
					'cookie-banner-view',
					'total,' + document.location.host.replace( /[^a-zA-Z0-9]/g, '-' )
				)
			);
	}, [ bannerStatus, dispatch ] );

	const copy = translate(
		'Our websites and dashboards use cookies. By continuing, you agree to their use. ' +
			'{{a}}Learn more{{/a}}, including how to control cookies.',
		{
			components: {
				a: <a href={ localizeUrl( 'https://automattic.com/cookies' ) } />,
			},
		}
	);
	return (
		<Card
			compact
			className={ classNames( 'gdpr-banner', {
				'gdpr-banner__hidden': bannerStatus === STATUS.HIDDEN,
				'gdpr-banner__hiding': bannerStatus === STATUS.HIDING,
			} ) }
		>
			<div className="gdpr-banner__text-content">{ preventWidows( copy ) }</div>
			<div className="gdpr-banner__buttons">
				<Button className="gdpr-banner__acknowledge-button" onClick={ acknowledgeClicked }>
					{ translate( 'Got it!' ) }
				</Button>
			</div>
		</Card>
	);
}
