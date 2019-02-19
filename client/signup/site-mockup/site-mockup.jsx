/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './site-mockup.scss';

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
		<>
			<div className="site-mockup__site-identity">
				<div className="site-mockup__title">{ title }</div>
				<div className="site-mockup__tagline">{ tagline }</div>
			</div>
			<div className="site-mockup__entry-content" dangerouslySetInnerHTML={ { __html: content } } />
		</>
	);
	/* eslint-enable react/no-danger */
}

function SiteMockupOutlines() {
	return (
		<>
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
		</>
	);
}

export default function SiteMockup( { size, content, siteType, siteStyle, title, tagline } ) {
	const classes = classNames( 'site-mockup__viewport', `is-${ size }`, {
		[ `is-${ siteType }` ]: !! siteType,
		[ `is-${ siteStyle }` ]: !! siteStyle,
	} );
	return (
		<div className={ classes }>
			{ size === 'mobile' ? <MockupChromeMobile /> : <MockupChromeDesktop /> }
			<div className="site-mockup__body">
				<div className="site-mockup__content">
					{ isEmpty( content ) ? (
						<SiteMockupOutlines />
					) : (
						<SiteMockupContent { ...{ content, title, tagline } } />
					) }
				</div>
			</div>
		</div>
	);
}
