/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ImagePreloader from 'components/image-preloader';
import SignupSitePreviewIframe from 'components/signup-site-preview/iframe';
import Spinner from 'components/spinner';
import { getSiteVerticalPreviewScreenshot } from 'state/signup/steps/site-vertical/selectors';

/**
 * Style dependencies
 */
import './style.scss';

function MockupChromeMobile( { translate } ) {
	return (
		<div className="signup-site-preview__chrome-mobile">
			<span className="signup-site-preview__chrome-label">
				{ translate( 'Phone Preview', {
					comment: 'Label for a phone-sized preview of a website',
				} ) }
			</span>
		</div>
	);
}

function MockupChromeDesktop( { translate } ) {
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
		className: PropTypes.string,
		cssUrl: PropTypes.string,
		// The viewport device to show initially
		defaultViewportDevice: PropTypes.oneOf( [ 'desktop', 'phone' ] ),
		fontUrl: PropTypes.string,
		gutenbergStylesUrl: PropTypes.string,
		isRtl: PropTypes.bool,
		langSlug: PropTypes.string,
		// Iframe body content
		content: PropTypes.object,
		onPreviewClick: PropTypes.func,
		resize: PropTypes.bool,
		scrolling: PropTypes.bool,
		screenshotUrl: PropTypes.string,
	};

	static defaultProps = {
		className: '',
		defaultViewportDevice: 'desktop',
		isRtl: false,
		langSlug: 'en',
		content: {},
		onPreviewClick: () => {},
		resize: false,
		scrolling: true,
	};

	constructor( props ) {
		super( props );
		this.state = {
			isLoaded: false,
			wrapperHeight: 800,
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
	setWrapperHeight = wrapperHeight => this.setState( { wrapperHeight } );

	render() {
		const { isDesktop, isPhone, screenshotUrl, translate } = this.props;
		const className = classNames( this.props.className, 'signup-site-preview__wrapper', {
			'is-desktop': isDesktop,
			'is-phone': isPhone,
		} );
		const usingScreenshot = !! screenshotUrl;
		const wrapperHeightStyle = {
			height: usingScreenshot ? 'auto' : this.state.wrapperHeight,
		};

		const spinner = <Spinner size={ isPhone ? 20 : 40 } />;
		const chrome = isPhone ? (
			<MockupChromeMobile translate={ translate } />
		) : (
			<MockupChromeDesktop translate={ translate } />
		);

		return (
			<div className={ className } style={ this.props.resize ? wrapperHeightStyle : null }>
				<div className="signup-site-preview__iframe-wrapper">
					{ chrome }

					{ ! usingScreenshot && this.state.isLoading && spinner }
					{ ! usingScreenshot && (
						<SignupSitePreviewIframe
							{ ...this.props }
							setIsLoaded={ this.setIsLoaded }
							setWrapperHeight={ this.setWrapperHeight }
						/>
					) }

					{ usingScreenshot && (
						<div style={ isPhone ? { height: '100%', overflowY: 'scroll' } : {} }>
							<ImagePreloader
								src={ screenshotUrl }
								placeholder={ spinner }
								alt={
									isPhone
										? translate( 'Preview of site with phone layout', {
												comment: 'alt text of site preview',
										  } )
										: translate( 'Preview of site with desktop layout', {
												comment: 'alt text of site preview',
										  } )
								}
							/>
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isDesktop: 'desktop' === ownProps.defaultViewportDevice,
		isPhone: 'phone' === ownProps.defaultViewportDevice,
		screenshotUrl: getSiteVerticalPreviewScreenshot( state, ownProps.defaultViewportDevice ),
	} ),
	null
)( localize( SignupSitePreview ) );
