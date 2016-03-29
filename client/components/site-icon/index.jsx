/**
 * External dependencies
 */
import React from 'react';
import url from 'url';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const SiteIcon = React.createClass( {
	getDefaultProps() {
		return {
			// Cache a larger image so there's no need to download different
			// assets to display the site icons in different contexts.
			imgSize: 120,
			size: 32
		};
	},

	propTypes: {
		imgSize: React.PropTypes.number,
		site: React.PropTypes.object,
		size: React.PropTypes.number
	},

	imgSizeParam( host ) {
		return host && host.indexOf( 'gravatar.com' ) === -1 ? 'w' : 's';
	},

	getIconSrcURL( imgURL ) {
		var parsed = url.parse( imgURL, true, true ),
			sizeParam = this.imgSizeParam( parsed.host );

		parsed.query[sizeParam] = this.props.imgSize;

		// Use query param to set retina size: we use the same
		// size everyhere, even if the intended display size is
		// a bit smaller, to keep just one cached image per site.
		return url.format( parsed );
	},

	render() {
		var iconSrc, iconClasses, style;

		// Set the site icon path if it's available
		iconSrc = ( this.props.site && this.props.site.icon ) ? this.getIconSrcURL( this.props.site.icon.img ) : null;

		iconClasses = classNames( {
			'site-icon': true,
			'is-blank': ! iconSrc
		} );

		// Size inline styles
		style = {
			height: this.props.size,
			width: this.props.size,
			lineHeight: this.props.size + 'px',
			fontSize: this.props.size + 'px'
		};

		return (
			<div className={ iconClasses } style={ style }>
				{ iconSrc
					? <img className="site-icon__img" src={ iconSrc } />
					: <Gridicon icon="globe" size={ Math.round( this.props.size / 1.3 ) } />
				}
			</div>
		);
	}
} );

export default SiteIcon;
