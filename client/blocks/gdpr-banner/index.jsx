/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import cookie from 'cookie';
import { identity, includes } from 'lodash';
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
import { requestGeoLocation } from 'state/data-getters';

const gdprCountries = [
	// European Member countries
	'AT', // Austria
	'BE', // Belgium
	'BG', // Bulgaria
	'CY', // Cyprus
	'CZ', // Czech Republic
	'DE', // Germany
	'DK', // Denmark
	'EE', // Estonia
	'ES', // Spain
	'FI', // Finland
	'FR', // France
	'GR', // Greece
	'HR', // Croatia
	'HU', // Hungary
	'IE', // Ireland
	'IT', // Italy
	'LT', // Lithuania
	'LU', // Luxembourg
	'LV', // Latvia
	'MT', // Malta
	'NL', // Netherlands
	'PL', // Poland
	'PT', // Portugal
	'RO', // Romania
	'SE', // Sweden
	'SI', // Slovenia
	'SK', // Slovakia
	'GB', // United Kingdom
	// Single Market Countries that GDPR applies to
	'CH', // Switzerland
	'IS', // Iceland
	'LI', // Liechtenstein
	'NO', // Norway
];
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
		this.props.recordTracksEvent( 'calypso_sensitive_pixel_option_accepted' );
		this.setState( { showBanner: false } );
	};

	shouldShowBanner() {
		const cookies = cookie.parse( document.cookie );
		if ( cookies.sensitive_pixel_option === 'yes' || cookies.sensitive_pixel_option === 'no' ) {
			return false;
		}
		if ( ! includes( gdprCountries, this.props.countryCode ) ) {
			return false;
		}
		return true;
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
					eventName="calypso_gdpr_banner_impression"
					eventProperties={ {
						page: currentSection,
					} }
					statGroup="calypso_gdpr_banner"
					statName="impression"
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
		countryCode: requestGeoLocation().data,
		currentSection: getSectionName( state ),
	};
};

const mapDispatchToProps = {
	recordTracksEvent,
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( GdprBanner ) );
