/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import cookie from 'cookie';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { getSectionName } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import TrackComponentView from 'lib/analytics/track-component-view';
import { decodeEntities, preventWidows } from 'lib/formatting';
import { isCurrentUserMaybeInGdprZone } from 'lib/analytics/ad-tracking';

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60;

class GdprBanner extends Component {
	static propTypes = {
		translate: PropTypes.func,
		currentSection: PropTypes.string,
		countryCode: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		currentSection: undefined,
		countryCode: undefined,
	};

	state = {
		showBanner: true,
	};

	acknowledgeClicked = () => {
		document.cookie = cookie.serialize( 'sensitive_pixel_option', 'yes', {
			path: '/',
			maxAge: SIX_MONTHS,
		} );
		this.props.recordTracksEvent( 'a8c_cookie_banner_ok', {
			site: 'Calypso',
		} );
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
		const { translate, currentSection } = this.props;
		const copy = translate(
			'Our websites and dashboards use cookies. By continuing, you agree to their use. ' +
				'By using our website, you agree to our use of cookies in accordance with our cookie policy. ' +
				'{{a}}Learn more{{/a}}, including how to control cookies.',
			{
				components: {
					a: <a href="https://automattic.com/cookies" />,
				},
			}
		);
		const classes = {
			'is-compact': true,
			'gdpr-banner': true,
			'gdpr-banner__hiding': ! this.state.showBanner,
		};
		return (
			<Card className={ classNames( classes ) }>
				<TrackComponentView
					eventName="a8c_cookie_banner_view"
					eventProperties={ {
						page: currentSection,
						site: 'Calypso',
					} }
				/>
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

const mapStateToProps = state => {
	return {
		currentSection: getSectionName( state ),
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( GdprBanner ) );
