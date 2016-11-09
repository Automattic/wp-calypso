/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	classnames = require( 'classnames' );

/**
 * Main
 */
var PostImage = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		postImages: React.PropTypes.shape( {
			featured_image: React.PropTypes.string,
			canonical_image: React.PropTypes.shape( {
				uri: React.PropTypes.string.isRequired,
				width: React.PropTypes.number,
				height: React.PropTypes.number,
			} ),
			content_images: React.PropTypes.arrayOf( React.PropTypes.shape( {
				src: React.PropTypes.string.isRequired,
				width: React.PropTypes.number,
				height: React.PropTypes.number
			} ) ),
			images: React.PropTypes.arrayOf( React.PropTypes.shape( {
				src: React.PropTypes.string.isRequired,
				width: React.PropTypes.number,
				height: React.PropTypes.number
			} ) )
		} )
	},

	getInitialState: function() {
		return {
			collapsed: true
		};
	},

	render: function() {
		var imageURL = this._getImageURL(),
			containerClasses, containerStyles;

		if ( ! imageURL ) {
			return null;
		}

		if ( this.state.collapsed ) {
			containerStyles = {
				backgroundImage: 'url(' + imageURL + ')'
			};
		}

		containerClasses = classnames( {
			'post-image': true,
			'is-collapsed': this.state.collapsed
		} );

		return (
			<div className={ containerClasses } style={ containerStyles } onClick={ this._handleClick }>
				{ ( ! this.state.collapsed ) ?
					<img src={ imageURL } className="post-image__image" />
				: null }
			</div>
		);
	},

	_getImageURL: function() {
		var postImages = this.props.postImages;

		if ( postImages.featured_image !== '' ) {
			return postImages.featured_image;
		}

		if ( postImages.canonical_image && postImages.canonical_image.uri ) {
			return postImages.canonical_image.uri;
		}

		if ( postImages.content_images && postImages.content_images.length && postImages.content_images[ 0 ].src ) {
			return postImages.content_images[ 0 ].src;
		}

		if ( postImages.images && postImages.images.length ) {
			return postImages.images[ 0 ].src;
		}
	},

	_handleClick: function() {
		this.setState( {
			collapsed: ! this.state.collapsed
		} );
	}

} );

module.exports = PostImage;
