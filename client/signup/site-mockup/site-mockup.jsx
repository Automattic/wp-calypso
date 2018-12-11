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

function SiteMockupContent( { data, title, tagline } ) {
	/* eslint-disable react/no-danger */
	return (
		<>
			<div className="site-mockup__title">{ title }</div>
			<div className="site-mockup__tagline">{ tagline }</div>
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

export default function SiteMockup( { size, data, siteType, siteStyle, title, tagline } ) {
	const classes = classNames( 'site-mockup__viewport', `is-${ size }`, {
		[ `is-${ siteType }` ]: !! siteType,
		[ `is-${ siteStyle }` ]: !! siteStyle,
	} );
	return (
		<div className={ classes }>
			{ size === 'mobile' ? <MockupChromeMobile /> : <MockupChromeDesktop /> }
			<div className="site-mockup__body">
				<div className="site-mockup__content">
					{ isEmpty( data ) ? (
						<SiteMockupOutlines />
					) : (
						<SiteMockupContent { ...{ data, title, tagline } } />
					) }
				</div>
			</div>
		</div>
	);
}
