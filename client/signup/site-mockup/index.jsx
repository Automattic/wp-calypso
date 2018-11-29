/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSignupStepsSiteTopic } from 'state/signup/steps/site-topic/selectors';
import { getSiteInformation } from 'state/signup/steps/site-information/selectors';
import { getVerticalData } from './mock-data';

/**
 * Style dependencies
 */
import './style.scss';

class SiteMockup extends Component {
	static propTypes = {
		title: PropTypes.string,
		tagline: PropTypes.string,
		address: PropTypes.string,
		phone: PropTypes.string,
		vertical: PropTypes.string,
	};

	getMockupChromeDesktop() {
		return (
			<div className="site-mockup__chrome-desktop">
				<svg width="38" height="10">
					<g>
						<rect width="10" height="10" rx="5" />
						<rect x="14" width="10" height="10" rx="5" />
						<rect x="28" width="10" height="10" rx="5" />
					</g>
				</svg>
				<span className="site-mockup__chrome-label">{ translate( 'Website Preview' ) }</span>
			</div>
		);
	}

	getMockupChromeMobile() {
		return (
			<div className="site-mockup__chrome-mobile">
				<span className="site-mockup__chrome-label">
					{ translate( 'Phone', {
						context: 'Label for a phone-sized preview of a website',
					} ) }
				</span>
			</div>
		);
	}

	getTagline() {
		const { siteInformation } = this.props;
		if ( isEmpty( siteInformation ) ) {
			return translate( 'You’ll be able to customize this to your needs.' );
		}
		return (
			<>
				{ siteInformation.address && (
					<span className="site-mockup__address">
						{ this.formatAddress( siteInformation.address ) }
					</span>
				) }
				{ siteInformation.phone && (
					<span className="site-mockup__phone">{ siteInformation.phone }</span>
				) }
			</>
		);
	}

	/**
	 *
	 * @param {string} address An address formatted onto separate lines
	 * @return {string} Get rid of the last line of the address.
	 */
	formatAddress( address ) {
		const parts = address.split( '\n' );
		parts.pop();
		return parts.join( ', ' );
	}

	renderMockup( size = 'desktop' ) {
		const classes = classNames( 'site-mockup__viewport', size );
		const data = this.props.verticalData;
		const { title } = this.props;
		/* eslint-disable react/no-danger */
		return (
			<div className={ classes }>
				{ size === 'mobile' ? this.getMockupChromeMobile() : this.getMockupChromeDesktop() }
				<div className="site-mockup__body">
					<div className="site-mockup__content">
						<div className="site-mockup__title">{ title }</div>
						<div className="site-mockup__tagline">{ this.getTagline() }</div>
						<div
							className="site-mockup__cover-image"
							style={ { backgroundImage: `url("${ data.cover_image }")` } }
						>
							<span>{ data.cover_image_text }</span>
						</div>
						<div
							className="site-mockup__entry-content"
							dangerouslySetInnerHTML={ { __html: data.content } }
						/>
						<div className="site-mockup__hr" />
						<div className="site-mockup__h2">Send Us a Message</div>
						<div className="site-mockup__contact-form">
							<div className="site-mockup__label">Name</div>
							<div className="site-mockup__input" />
							<div className="site-mockup__label">Email</div>
							<div className="site-mockup__input" />
							<div className="site-mockup__label">Your Message</div>
							<div className="site-mockup__textarea" />
							<div className="site-mockup__button">Send</div>
						</div>
					</div>
				</div>
			</div>
		);
		/* eslint-enable react/no-danger */
	}

	render() {
		const siteMockupClasses = classNames( {
			'site-mockup__wrap': true,
		} );

		return (
			<div className={ siteMockupClasses }>
				{ this.renderMockup( 'desktop' ) }
				{ this.renderMockup( 'mobile' ) }
			</div>
		);
	}
}

export default connect( state => {
	const vertical = getSignupStepsSiteTopic( state );
	const verticalData = getVerticalData( vertical );
	return {
		title: getSiteTitle( state ) || translate( 'Your New Website' ),
		siteInformation: getSiteInformation( state ),
		vertical,
		verticalData,
	};
} )( SiteMockup );
