/** @format */
/**
 * External dependencies
 */
import React, { PureComponent, Fragment } from 'react';
import classNames from 'classnames';
import { isEmpty, noop } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

function MockupChromeMobile() {
	return (
		<div className="site-mockup__chrome-mobile">
			<span className="site-mockup__chrome-label">
				{ translate( 'Phone', {
					comment: 'Label for a phone-sized preview of a website',
				} ) }
			</span>
		</div>
	);
}

function MockupChromeDesktop() {
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

function SiteMockupContent( { content, title, tagline } ) {
	/* eslint-disable react/no-danger */
	return (
		<Fragment>
			<div className="site-mockup__site-identity site-header">
				<div className="site-mockup__site-branding site-branding-container">
					<div className="site-mockup__site-branding site-branding">
						<div className="site-mockup__title site-title">{ title }</div>
						<div className="site-mockup__tagline site-description">{ tagline }</div>
					</div>
				</div>
			</div>
			<div className="site-mockup__site-content site-content">
				<div className="site-mockup__content-area content-area">
					<div className="site-mockup__site-main site-main">
						<div className="site-mockup__entry entry">
							<div
								className="site-mockup__entry-content entry-content"
								dangerouslySetInnerHTML={ { __html: content } }
							/>
						</div>
					</div>
				</div>
			</div>
		</Fragment>
	);
	/* eslint-enable react/no-danger */
}

function SiteMockupOutlines() {
	return (
		<Fragment>
			<div className="site-mockup__outline is-title" />
			<div className="site-mockup__outline" />
			<div className="site-mockup__columns">
				<div className="site-mockup__column">
					<div className="site-mockup__outline" />
				</div>
				<div className="site-mockup__column">
					<div className="site-mockup__outline" />
				</div>
			</div>
			<div className="site-mockup__outline" />
		</Fragment>
	);
}

export class SiteMockup extends PureComponent {
	static defaultProps = {
		size: 'mobile',
		onClick: noop,
	};

	render() {
		const { size, content, siteType, siteStyle, title, tagline } = this.props;
		const classes = classNames( 'site-mockup__viewport', `is-${ size }`, {
			[ `is-${ siteType }` ]: !! siteType,
			[ `is-${ siteStyle }` ]: !! siteStyle,
		} );
		/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
		return (
			<div className={ classes } onClick={ this.props.onClick }>
				{ size === 'mobile' ? <MockupChromeMobile /> : <MockupChromeDesktop /> }
				<div className="site-mockup__html html">
					<div className="site-mockup__body body">
						<div className="site-mockup__site">
							{ isEmpty( content ) ? (
								<SiteMockupOutlines />
							) : (
								<SiteMockupContent { ...{ content, title, tagline } } />
							) }
						</div>
					</div>
				</div>
			</div>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
	}
}

export default SiteMockup;
