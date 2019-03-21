/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
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

const SiteMockup = React.memo(
	( { className, children, siteStyle, siteType, size = 'mobile', tagline, title } ) => (
		<div
			className={ classNames( 'site-mockup__viewport', `is-${ size }`, className, {
				[ `is-${ siteType }` ]: !! siteType,
				[ `is-${ siteStyle }` ]: !! siteStyle,
			} ) }
		>
			{ size === 'mobile' ? <MockupChromeMobile /> : <MockupChromeDesktop /> }
			<div className="site-mockup__body">
				<div className="site-mockup__content">
					{ ( title || tagline ) && (
						<div className="site-mockup__site-identity">
							{ title && <div className="site-mockup__title">{ title }</div> }
							{ tagline && <div className="site-mockup__tagline">{ tagline }</div> }
						</div>
					) }
					<div className="site-mockup__content">{ children }</div>
				</div>
			</div>
		</div>
	)
);

SiteMockup.displayName = 'SiteMockup';

export default SiteMockup;
