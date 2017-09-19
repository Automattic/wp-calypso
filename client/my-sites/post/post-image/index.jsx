var PropTypes = require('prop-types');
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
		postImages: PropTypes.shape( {
			featured_image: PropTypes.string,
			canonical_image: PropTypes.shape( {
				uri: PropTypes.string.isRequired,
				width: PropTypes.number,
				height: PropTypes.number,
			} ),
			content_images: PropTypes.arrayOf( PropTypes.shape( {
				src: PropTypes.string.isRequired,
				width: PropTypes.number,
				height: PropTypes.number
			} ) ),
			images: PropTypes.arrayOf( PropTypes.shape( {
				src: PropTypes.string.isRequired,
				width: PropTypes.number,
				height: PropTypes.number
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
