/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import { getSignupStepsSiteTopic } from 'state/signup/steps/site-topic/selectors';
import { getVerticalData } from './mock-data';

class SiteMockup extends Component {
	static propTypes = {
		title: PropTypes.string,
		tagline: PropTypes.string,
		address: PropTypes.string,
		phone: PropTypes.string,
		vertical: PropTypes.string,
	};

	static defaultProps = {
		title: 'Default Title',
		vertical: 'Mexican Food',
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
				<span className="site-mockup__chrome-label">Website Preview</span>
			</div>
		);
	}

	getMockupChromeMobile() {
		return (
			<div className="site-mockup__chrome-mobile">
				<span className="site-mockup__chrome-label">Phone</span>
			</div>
		);
	}

	renderMockup( size = 'desktop' ) {
		const classes = classNames( 'site-mockup__viewport', size );
		const data = this.props.verticalData;
		/* eslint-disable react/no-danger */
		return (
			<div className={ classes }>
				{ size === 'mobile' ? this.getMockupChromeMobile() : this.getMockupChromeDesktop() }
				<div className="site-mockup__body">
					<div className="site-mockup__content">
						<div className="site-mockup__title">Your New Website</div>
						<div className="site-mockup__tagline">
							You'll be able to customize this to your needs.
						</div>
						<div
							className="site-mockup__cover-image"
							style={ { backgroundImage: `url("${ data.cover_image }")` } }
						>
							<span>{ data.cover_image_text }</span>
						</div>
                        <div dangerouslySetInnerHTML={ { __html: data.content } } />
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
		title: getSiteTitle( state ),
		vertical,
		verticalData,
	};
} )( SiteMockup );
