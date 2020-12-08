/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import debugModule from 'debug';
import { assign, pick } from 'lodash';

/**
 * Internal dependencies
 */
import Shortcode from 'calypso/blocks/shortcode';
import { parse as parseShortcode } from 'calypso/lib/shortcode';
import { generateGalleryShortcode } from 'calypso/lib/media/utils';
import { GalleryDefaultAttrs } from 'calypso/lib/media/constants';
import { SiteId } from 'calypso/types';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:gallery-shortcode' );

interface Props {
	siteId: SiteId;
	items?: unknown[];
	type?: string;
	columns?: number;
	orderBy?: string;
	link?: string;
	size?: string;
	className?: string;
	children?: string;
}

interface RenderedShortcode {
	body?: unknown;
	scripts?: unknown;
	styles?: unknown;
}

export default class GalleryShortcode extends Component< Props > {
	static defaultProps = GalleryDefaultAttrs;

	filterRenderResult = ( rendered: RenderedShortcode ) => {
		if ( ! rendered.body && ! rendered.scripts && ! rendered.styles ) {
			return rendered;
		}

		const filtered = assign( {}, rendered, {
			scripts: {
				'tiled-gallery': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/tiled-gallery/tiled-gallery.js',
				},
			},
			styles: {
				'tiled-gallery': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/tiled-gallery/tiled-gallery.css',
				},
				'gallery-styles': {
					src: 'https://widgets.wp.com/gallery-preview/style.css',
				},
			},
		} );

		if ( 'slideshow' === this.getAttributes().type ) {
			assign( filtered, {
				scripts: {
					'jquery-cycle': {
						src: 'https://s0.wp.com/wp-content/mu-plugins/shortcodes/js/jquery.cycle.min.js',
					},
					'jetpack-slideshow': {
						src: 'https://s0.wp.com/wp-content/mu-plugins/shortcodes/js/slideshow-shortcode.js',
						extra:
							'var jetpackSlideshowSettings = { "spinner": "https://s0.wp.com/wp-content/mu-plugins/shortcodes/img/slideshow-loader.gif" };',
					},
				},
				styles: {
					'jetpack-slideshow': {
						src: 'https://s0.wp.com/wp-content/mu-plugins/shortcodes/css/slideshow-shortcode.css',
					},
				},
			} );
		}

		return filtered;
	};

	getAttributes = () => {
		const attributes = pick( this.props, 'items', 'type', 'columns', 'orderBy', 'link', 'size' );

		if ( this.props.children ) {
			assign( attributes, parseShortcode( this.props.children ).attrs.named );
		}

		return attributes;
	};

	getShortcode = () => {
		if ( this.props.children ) {
			return this.props.children;
		}

		return generateGalleryShortcode( this.getAttributes() );
	};

	render() {
		const shortcode = this.getShortcode();
		if ( ! shortcode ) {
			return null;
		}

		debug( shortcode );

		const {
			siteId,
			items,
			type,
			columns,
			orderBy,
			link,
			size,
			className,
			children,
			...restProps
		} = this.props;

		const classes = classNames( 'gallery-shortcode', className );

		return (
			<Shortcode
				{ ...restProps }
				siteId={ siteId }
				filterRenderResult={ this.filterRenderResult }
				className={ classes }
			>
				{ shortcode }
			</Shortcode>
		);
	}
}
