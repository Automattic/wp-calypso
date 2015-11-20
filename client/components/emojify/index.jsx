/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	PureRenderMixin = React.addons.PureRenderMixin,
	punycode = require( 'punycode' );

/**
 * Internal dependencies
 */
var baseCDNUrl = '//s0.wp.com/wp-content/mu-plugins/emoji/twemoji/';

module.exports = React.createClass( {
	mixins: [ PureRenderMixin ],
	propTypes: {
		children: React.PropTypes.string.isRequired,

		 // Optional. These are dependent on your CDN.
		size: React.PropTypes.oneOf( [
			'16x16', '36x36', '72x72'
		] )
	},

	getDefaultProps: function() {
		return {
			size: '36x36'
		};
	},

	isEmojiCode: function( charCode ) {
		return (
			( charCode >= 0x1F300 && charCode <= 0x1F5FF ) ||
			( charCode >= 0x1F600 && charCode <= 0x1F64F ) ||
			( charCode >= 0x1F680 && charCode <= 0x1F6FF ) ||
			( charCode >= 0x2600 && charCode <= 0x26FF )
		);
	},

	emojiTransform: function( text ) {
		var decoded,
			entries = [];

		if ( null === text ) {
			return null;
		}

		decoded = punycode.ucs2.decode( text );

		decoded.forEach( function( charCode, idx ) {
			var hexCode,
				lastIdx,
				src,
				char;

			if ( this.isEmojiCode( charCode ) ) {

				// emoji char encountered, insert img tag
				hexCode = charCode.toString( 16 );
				src = encodeURI( baseCDNUrl + this.props.size + '/' + hexCode + '.png' );

				entries.push(
					<img className="emojified__emoji" src={ src } key={ idx } alt={ 'U+' + hexCode } />
				);
			} else {
				char = punycode.ucs2.encode( [ charCode ] );
				lastIdx = entries.length - 1;

				if ( typeof entries[ lastIdx ] === 'string' ) {
					entries[ lastIdx ] += char;
				} else {
					entries.push( char );
				}
			}
		}, this );

		return entries;
	},

	render: function() {
		return (
			<span>{ this.emojiTransform( this.props.children ) }</span>
		);
	}
} );
