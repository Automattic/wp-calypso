import clsx from 'clsx';
import debugModule from 'debug';
import { pick } from 'lodash';
import { Component } from 'react';
import Shortcode from 'calypso/blocks/shortcode';
import { GalleryDefaultAttrs } from 'calypso/lib/media/constants';
import { generateGalleryShortcode } from 'calypso/lib/media/utils';
import { parse as parseShortcode } from 'calypso/lib/shortcode';
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

		const filtered: Record<
			'scripts' | 'styles',
			Record< string, { src: string; extra?: string } >
		> = {
			...rendered,
			scripts: {
				'tiled-gallery': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/tiled-gallery/tiled-gallery/tiled-gallery.js',
				},
			},
			styles: {
				'tiled-gallery': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/tiled-gallery/tiled-gallery/tiled-gallery.css',
				},
				'gallery-styles': {
					src: 'https://widgets.wp.com/gallery-preview/style.css',
				},
			},
		};

		if ( 'slideshow' === this.getAttributes().type ) {
			filtered.scripts = {
				'jquery-cycle': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/shortcodes/js/jquery.cycle.min.js',
				},
				'jetpack-slideshow': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/shortcodes/js/slideshow-shortcode.js',
					extra:
						'var jetpackSlideshowSettings = { "spinner": "https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/shortcodes/img/slideshow-loader.gif" };',
				},
			};
			filtered.styles = {
				'jetpack-slideshow': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/jetpack-plugin/production/modules/shortcodes/css/slideshow-shortcode.css',
				},
			};
		}

		return filtered;
	};

	getAttributes = () => {
		let attributes = pick( this.props, 'items', 'type', 'columns', 'orderBy', 'link', 'size' );

		if ( this.props.children ) {
			attributes = { ...attributes, ...parseShortcode( this.props.children )?.attrs?.named };
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

		const { siteId, items, type, columns, orderBy, link, size, className, children, ...restProps } =
			this.props;

		const classes = clsx( 'gallery-shortcode', className );

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
