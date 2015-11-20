/**
 * External dependencies
 */
var React = require( 'react' ),
	url = require( 'url' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'SiteIcon',

	getDefaultProps: function() {
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

	imgSizeParam: function( host ) {
		return host && host.indexOf( 'gravatar.com' ) === -1 ? 'w' : 's';
	},

	getIconSrcURL: function( imgURL ) {
		var parsed = url.parse( imgURL, true , true ),
			sizeParam = this.imgSizeParam( parsed.host );

		parsed.query[sizeParam] = this.props.imgSize;

		// Use query param to set retina size: we use the same
		// size everyhere, even if the intended display size is
		// a bit smaller, to keep just one cached image per site.
		return url.format( parsed );
	},

	render: function() {
		var iconSrc, iconClasses, style, noticonStyle;

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
			lineHeight: this.props.size + 'px'
		};

		// @todo have a Noticon component, or Gridicon component
		noticonStyle = {
			color: '#fff',
			fontSize: ( this.props.size / 1.2 ) + 'px',
			lineHeight: this.props.size + 'px',
			width: this.props.size
		};

		return (
			<div className={ iconClasses } style={ style }>
				{ iconSrc ?
					<img className="site-icon__img" src={ iconSrc } />
				:
					<span className="noticon noticon-website" style={ noticonStyle } />
				}
			</div>
		);
	}
} );
