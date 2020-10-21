/**
 * External dependencies
 */
import classNames from 'classnames';
import cookie from 'cookie';
import { noop } from 'lodash';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { bumpStat, recordTracksEvent } from 'calypso/state/analytics/actions';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { isCurrentUserMaybeInGdprZone } from 'calypso/lib/analytics/utils';
import { isWpMobileApp } from 'calypso/lib/mobile-app';

/**
 * Internal dependencies
 */
import './style.scss';

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60;

const STATUS = {
	NOT_RENDERED: 'not-rendered',
	RENDERED: 'rendered',
	RENDERED_BUT_HIDDEN: 'rendered-but-hidden',
};

const hasDocument = typeof document !== 'undefined';

function shouldShowBanner() {
	// Don't render banner in SSR.
	if ( ! hasDocument ) {
		return false;
	}
	const cookies = cookie.parse( document.cookie );
	if ( cookies.sensitive_pixel_option === 'yes' || cookies.sensitive_pixel_option === 'no' ) {
		return false;
	}
	if ( isWpMobileApp() ) {
		return false;
	}
	if ( isCurrentUserMaybeInGdprZone() ) {
		return true;
	}
	return false;
}

function GdprBanner( props ) {
	const [ bannerStatus, setBannerStatus ] = useState( STATUS.NOT_RENDERED );
	const translate = useTranslate();

	const { recordCookieBannerOk, recordCookieBannerView } = props;

	const acknowledgeClicked = () => {
		document.cookie = cookie.serialize( 'sensitive_pixel_option', 'yes', {
			path: '/',
			maxAge: SIX_MONTHS,
		} );
		recordCookieBannerOk();
		setBannerStatus( STATUS.RENDERED_BUT_HIDDEN );
	};

	// We want to ensure that the first render is always empty, to match the server.
	// This avoids potential hydration issues.
	useEffect( () => {
		shouldShowBanner() && setBannerStatus( STATUS.RENDERED );
	}, [] );

	useEffect( () => {
		bannerStatus === STATUS.RENDERED && recordCookieBannerView();
	}, [ bannerStatus, recordCookieBannerView ] );

	if ( bannerStatus === STATUS.NOT_RENDERED ) {
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
				'gdpr-banner__hiding': bannerStatus === STATUS.RENDERED_BUT_HIDDEN,
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
