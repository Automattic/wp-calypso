/**
 * External dependencies
 */
const React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	resizeImageUrl = require( 'lib/resize-image-url' );

const PostImages = React.createClass( {
	mixins: [ PureRenderMixin ],

	render: function() {
		const images = this.props.postImages,
			count = images.length;

		return (
			<div className="post-images">
				<PostImageThumbList postImages={ images.slice( 0, 5 ) } />
			</div>
		);
	}

} );

const PostImageThumbList = React.createClass( {

	mixins: [ PureRenderMixin ],

	render: function() {
		const images = this.props.postImages,
			thumbList = images.map( function( image, index ) {
				return (
					<li key={ 'thumb-image-' + index } className="post-images__item">
						<img className="post-images__image" src={ resizeImageUrl( image.src, { resize: '640,130' } ) } />
					</li>
				);
			} );

		return (
			<ol className="post-images__list">
				{ thumbList }
			</ol>
		);
	}

} );

module.exports = PostImages;
