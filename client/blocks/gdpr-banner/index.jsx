import { Button, Card } from '@automattic/components';
import classNames from 'classnames';
import cookie from 'cookie';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { isCurrentUserMaybeInGdprZone } from 'calypso/lib/analytics/utils';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const noop = () => {};
const SIX_MONTHS = 6 * 30 * 24 * 60 * 60;
const STATUS = {
	VISIBLE: 'visible',
	HIDDEN: 'hidden',
	HIDING: 'hiding', // Only used when the user clicks to accept.
};

const hasDocument = typeof document !== 'undefined';

function shouldShowBanner( requestCookies ) {
	const cookies = hasDocument ? cookie.parse( document.cookie ) : requestCookies;
	if ( cookies.sensitive_pixel_option === 'yes' || cookies.sensitive_pixel_option === 'no' ) {
		return false;
	}
	if ( isWpMobileApp() ) {
		return false;
	}
	if ( isCurrentUserMaybeInGdprZone( cookies ) ) {
		return true;
	}
	return false;
}

function GdprBanner( props ) {
	const { recordCookieBannerOk, recordCookieBannerView, requestCookies } = props;

	const shouldShow = shouldShowBanner( requestCookies );
	const [ bannerStatus, setBannerStatus ] = useState( shouldShow ? STATUS.VISIBLE : STATUS.HIDDEN );
	const translate = useTranslate();

	const acknowledgeClicked = () => {
		document.cookie = cookie.serialize( 'sensitive_pixel_option', 'yes', {
			path: '/',
			maxAge: SIX_MONTHS,
		} );
		recordCookieBannerOk();
		setBannerStatus( STATUS.HIDING );
	};

	useEffect( () => {
		bannerStatus === STATUS.VISIBLE && recordCookieBannerView();
	}, [ bannerStatus, recordCookieBannerView ] );

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

GdprBanner.propTypes = {
	recordCookieBannerOk: PropTypes.func,
	recordCookieBannerView: PropTypes.func,
};

GdprBanner.defaultProps = {
	recordCookieBannerOk: noop,
	recordCookieBannerView: noop,
};

const mapDispatchToProps = {
	recordCookieBannerOk: () => recordTracksEvent( 'a8c_cookie_banner_ok', { site: 'Calypso' } ),
	recordCookieBannerView: () =>
		bumpStat(
			'cookie-banner-view',
			'total,' + document.location.host.replace( /[^a-zA-Z0-9]/g, '-' )
		),
};

export default connect( null, mapDispatchToProps )( GdprBanner );
