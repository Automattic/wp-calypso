import { Button, Card } from '@automattic/components';
import classNames from 'classnames';
import cookie from 'cookie';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	getCountryCodeFromCookies,
	refreshCountryCodeCookieGdpr,
	shouldSeeGdprBanner,
} from 'calypso/lib/analytics/utils';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
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

export default function GdprBanner( { shouldRenderGdprBannerOnServer } ) {
	const dispatch = useDispatch();
	let country;
	let cookies;

	if ( ! isServer ) {
		cookies = cookie.parse( document.cookie );
		country = getCountryCodeFromCookies( cookies );
	}

	const shouldShow = isServer ? shouldRenderGdprBannerOnServer : shouldSeeGdprBanner( cookies );
	const [ bannerStatus, setBannerStatus ] = useState( shouldShow ? STATUS.VISIBLE : STATUS.HIDDEN );

	const [ waitingForCountry, setWaitingForCountry ] = useState( ! isServer && ! country );
	useEffect( () => {
		if ( waitingForCountry ) {
			refreshCountryCodeCookieGdpr().then( () => {
				cookies = cookie.parse( document.cookie );
				setBannerStatus( shouldSeeGdprBanner( cookies ) ? STATUS.VISIBLE : STATUS.HIDDEN );
				setWaitingForCountry( false );
			} );
		}
	}, [ waitingForCountry ] );

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

	if ( waitingForCountry ) {
		return null;
	}

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
			<div className="gdpr-banner__text-content">{ preventWidows( decodeEntities( copy ) ) }</div>
			<div className="gdpr-banner__buttons">
				<Button className="gdpr-banner__acknowledge-button" onClick={ acknowledgeClicked }>
					{ translate( 'Got it!' ) }
				</Button>
			</div>
		</Card>
	);
}
