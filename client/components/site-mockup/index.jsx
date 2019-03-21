/** @format */
/**
 * External dependencies
 */
import React, { PureComponent, Fragment } from 'react';
import classNames from 'classnames';
import { isEmpty, noop, isFunction } from 'lodash';
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

function SiteMockupContent( { content, title, tagline, renderContent } ) {
	/* eslint-disable react/no-danger */
	return (
		<Fragment>
			{ ( title || tagline ) && (
				<div className="site-mockup__site-identity">
					{ title && <div className="site-mockup__title">{ title }</div> }
					{ tagline && <div className="site-mockup__tagline">{ tagline }</div> }
				</div>
			) }
			{ isFunction( renderContent ) ? (
				<div className="site-mockup__entry-content">{ renderContent() }</div>
			) : (
				<div
					className="site-mockup__entry-content"
					dangerouslySetInnerHTML={ { __html: content } }
				/>
			) }
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
		const {
			size,
			className,
			content,
			renderContent,
			siteType,
			siteStyle,
			title,
			tagline,
		} = this.props;
		const classes = classNames( 'site-mockup__viewport', `is-${ size }`, className, {
			[ `is-${ siteType }` ]: !! siteType,
			[ `is-${ siteStyle }` ]: !! siteStyle,
		} );

		/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
		return (
			<div className={ classes } onClick={ this.props.onClick }>
				{ size === 'mobile' ? <MockupChromeMobile /> : <MockupChromeDesktop /> }
				<div className="site-mockup__body">
					<div className="site-mockup__content">
						{ isEmpty( content ) && ! isFunction( renderContent ) ? (
							<SiteMockupOutlines />
						) : (
							<SiteMockupContent { ...{ content, title, tagline, renderContent } } />
						) }
					</div>
				</div>
			</div>
		);
		/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
	}
}

export default SiteMockup;
