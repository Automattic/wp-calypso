/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import cookie from 'cookie';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { localizeUrl } from 'lib/i18n-utils';
import { bumpStat, recordTracksEvent } from 'state/analytics/actions';
import { decodeEntities, preventWidows } from 'lib/formatting';
import { isCurrentUserMaybeInGdprZone } from 'lib/analytics/utils';

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60;

class GdprBanner extends Component {
	static propTypes = {
		recordCookieBannerOk: PropTypes.func,
		recordCookieBannerView: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		recordCookieBannerOk: noop,
		recordCookieBannerView: noop,
		translate: identity,
	};

	state = {
		showBanner: true,
	};

	acknowledgeClicked = () => {
		document.cookie = cookie.serialize( 'sensitive_pixel_option', 'yes', {
			path: '/',
			maxAge: SIX_MONTHS,
		} );
		this.props.recordCookieBannerOk();
		this.setState( { showBanner: false } );
	};

	shouldShowBanner() {
		const cookies = cookie.parse( document.cookie );
		if ( cookies.sensitive_pixel_option === 'yes' || cookies.sensitive_pixel_option === 'no' ) {
			return false;
		}
		if ( isCurrentUserMaybeInGdprZone() ) {
			return true;
		}
		return false;
	}

	render() {
		if ( ! this.shouldShowBanner() ) {
			return null;
		}
		const { translate } = this.props;
		const copy = translate(
			'Our websites and dashboards use cookies. By continuing, you agree to their use. ' +
				'{{a}}Learn more{{/a}}, including how to control cookies.',
			{
				components: {
					a: <a href={ localizeUrl( 'https://automattic.com/cookies' ) } />,
				},
			}
		);
		const classes = {
			'is-compact': true,
			'gdpr-banner': true,
			'gdpr-banner__hiding': ! this.state.showBanner,
		};
		this.props.recordCookieBannerView();
		return (
			<Card className={ classNames( classes ) }>
				<div className="gdpr-banner__text-content">{ preventWidows( decodeEntities( copy ) ) }</div>
				<div className="gdpr-banner__buttons">
					<Button className="gdpr-banner__acknowledge-button" onClick={ this.acknowledgeClicked }>
						{ translate( 'Got it!' ) }
					</Button>
				</div>
			</Card>
		);
	}
}

const mapDispatchToProps = {
	recordCookieBannerOk: () => recordTracksEvent( 'a8c_cookie_banner_ok', { site: 'Calypso' } ),
	recordCookieBannerView: () =>
		bumpStat(
			'cookie-banner-view',
			'total,' + document.location.host.replace( /[^a-zA-Z0-9]/g, '-' )
		),
};

export default connect(
	null,
	mapDispatchToProps
)( localize( GdprBanner ) );
