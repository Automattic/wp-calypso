/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SignupSitePreviewIframe from 'components/signup-site-preview/iframe';
import Spinner from 'components/spinner';

/**
 * Style dependencies
 */
import './style.scss';

function MockupChromeMobile() {
	return (
		<div className="signup-site-preview__chrome-mobile">
			<span className="signup-site-preview__chrome-label">
				{ translate( 'Phone', {
					comment: 'Label for a phone-sized preview of a website',
				} ) }
			</span>
		</div>
	);
}

function MockupChromeDesktop() {
	return (
		<div className="signup-site-preview__chrome-desktop">
			<svg width="38" height="10">
				<g>
					<rect width="10" height="10" rx="5" />
					<rect x="14" width="10" height="10" rx="5" />
					<rect x="28" width="10" height="10" rx="5" />
				</g>
			</svg>
			<span className="signup-site-preview__chrome-label">{ translate( 'Website Preview' ) }</span>
		</div>
	);
}

export class SignupSitePreview extends Component {
	static propTypes = {
		// The viewport device to show initially
		defaultViewportDevice: PropTypes.oneOf( [ 'desktop', 'phone' ] ),
		isRtl: PropTypes.bool,
		langSlug: PropTypes.string,
		cssUrl: PropTypes.string,
		fontUrl: PropTypes.string,
		// Iframe body content
		content: PropTypes.object,
		onPreviewClick: PropTypes.func,
	};

	static defaultProps = {
		defaultViewportDevice: 'desktop',
		isRtl: false,
		langSlug: 'en',
		content: {},
		onPreviewClick: () => {},
	};

	constructor( props ) {
		super( props );
		this.state = {
			isLoaded: false,
		};
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.cssUrl !== prevProps.cssUrl ||
			this.props.fontUrl !== prevProps.fontUrl ||
			this.props.langSlug !== prevProps.langSlug
		) {
			this.setIsLoaded( false );
		}
	}

	setIsLoaded = isLoaded => this.setState( { isLoaded } );

	render() {
		const { isDesktop, isPhone } = this.props;
		const className = classNames( this.props.className, 'signup-site-preview__wrapper', {
			'is-desktop': isDesktop,
			'is-phone': isPhone,
		} );

		return (
			<div className={ className }>
				<div className="signup-site-preview__iframe-wrapper">
					{ isPhone ? <MockupChromeMobile /> : <MockupChromeDesktop /> }
					{ ! this.state.isLoaded && <Spinner size={ 40 } /> }
					<SignupSitePreviewIframe { ...this.props } setIsLoaded={ this.setIsLoaded } />
				</div>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isDesktop: 'desktop' === ownProps.defaultViewportDevice,
		isPhone: 'phone' === ownProps.defaultViewportDevice,
	} ),
	null
)( localize( SignupSitePreview ) );
