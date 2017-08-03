/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import debugModule from 'debug';
import assign from 'lodash/assign';
import pick from 'lodash/pick';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import Shortcode from 'components/shortcode';
import { parse as parseShortcode } from 'lib/shortcode';
import MediaUtils from 'lib/media/utils';
import { GalleryDefaultAttrs } from 'lib/media/constants';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:gallery-shortcode' );

export default React.createClass( {
	displayName: 'GalleryShortcode',

	propTypes: {
		siteId: PropTypes.number.isRequired,
		children: PropTypes.string,
		items: PropTypes.array,
		type: PropTypes.string,
		columns: PropTypes.number,
		orderBy: PropTypes.string,
		link: PropTypes.string,
		size: PropTypes.string,
		className: PropTypes.string
	},

	getDefaultProps() {
		return GalleryDefaultAttrs;
	},

	filterRenderResult( rendered ) {
		if ( ! rendered.body && ! rendered.scripts && ! rendered.styles ) {
			return rendered;
		}

		const filtered = assign( {}, rendered, {
			scripts: {
				'tiled-gallery': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/tiled-gallery/tiled-gallery.js'
				}
			},
			styles: {
				'tiled-gallery': {
					src: 'https://s0.wp.com/wp-content/mu-plugins/tiled-gallery/tiled-gallery.css'
				},
				'gallery-styles': {
					src: 'https://widgets.wp.com/gallery-preview/style.css'
				}
			}
		} );

		if ( 'slideshow' === this.getAttributes().type ) {
			assign( filtered, {
				scripts: {
					'jquery-cycle': {
						src: 'https://s0.wp.com/wp-content/mu-plugins/shortcodes/js/jquery.cycle.min.js'
					},
					'jetpack-slideshow': {
						src: 'https://s0.wp.com/wp-content/mu-plugins/shortcodes/js/slideshow-shortcode.js',
						extra: 'var jetpackSlideshowSettings = { "spinner": "https://s0.wp.com/wp-content/mu-plugins/shortcodes/img/slideshow-loader.gif" };'
					}
				},
				styles: {
					'jetpack-slideshow': {
						src: 'https://s0.wp.com/wp-content/mu-plugins/shortcodes/css/slideshow-shortcode.css'
					}
				}
			} );
		}

		return filtered;
	},

	getAttributes() {
		let attributes = pick( this.props, 'items', 'type', 'columns', 'orderBy', 'link', 'size' );

		if ( this.props.children ) {
			assign( attributes, parseShortcode( this.props.children ).attrs.named );
		}

		return attributes;
	},

	getShortcode() {
		if ( this.props.children ) {
			return this.props.children;
		}

		return MediaUtils.generateGalleryShortcode( this.getAttributes() );
	},

	render() {
		const shortcode = this.getShortcode();
		if ( ! shortcode ) {
			return null;
		}

		const classes = classNames( 'gallery-shortcode', this.props.className );

		debug( shortcode );

		return (
			<Shortcode
				{ ...omit( this.props, Object.keys( this.constructor.propTypes ) ) }
				siteId={ this.props.siteId }
				filterRenderResult={ this.filterRenderResult }
				className={ classes }>
				{ shortcode }
			</Shortcode>
		);
	}
} );
