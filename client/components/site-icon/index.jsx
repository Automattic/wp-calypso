/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { parse as parseUrl } from 'url';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import resizeImageUrl from 'lib/resize-image-url';
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
		siteId: React.PropTypes.number,
		site: React.PropTypes.object,
		size: React.PropTypes.number
	},

	getIconSrcUrl( imageUrl ) {
		const { host } = parseUrl( imageUrl, true, true );
		const sizeParam = includes( host, 'gravatar.com' ) ? 's' : 'w';

		return resizeImageUrl( imageUrl, {
			[ sizeParam ]: this.props.imgSize
		} );
	},

	render() {
		var iconSrc, iconClasses, style;

		// Set the site icon path if it's available
		iconSrc = ( this.props.site && this.props.site.icon ) ? this.getIconSrcUrl( this.props.site.icon.img ) : null;

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

export default connect( ( state, { siteId } ) => (
	siteId ? { site: getSite( state, siteId ) } : {}
) )( SiteIcon );
