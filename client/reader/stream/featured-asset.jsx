/**
* External dependencies
*/
import React from 'react';

export default class FeaturedAsset extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			featuredImage: '',
			useFeaturedEmbed: props.useFeaturedEmbed
		};
	}

	componentDidMount() {
		if ( this.props.featuredImage ) {
			const img = new Image();
			img.onload = () => this.setState( { featuredImage: this.props.featuredImage } );

			// try using featured embed if featured image is not available
			img.onerror = () => this.setState( { useFeaturedEmbed: this.props.featuredEmbed } );
			img.src = this.props.featuredImage;
		}
	}

	render() {
		if ( this.state.useFeaturedEmbed ) {
			return (
				<div ref="featuredEmbed"
					className="reader__post-featured-video"
					key="featuredVideo"
					dangerouslySetInnerHTML={ { __html: this.props.featuredEmbed.iframe } } />   //eslint-disable-line react/no-danger
			);
		}

		return (
			<div
				className="reader-full-post__featured-image" >
				{ this.state.featuredImage
				? <img className="reader__post-featured-image-image"
						ref="featuredImage"
						src={ this.state.featuredImage }
						style={ this.props.featuredSize }
					/>
				: null
				}
			</div>
		);
	}
}

FeaturedAsset.propTypes = {
	featuredEmbed: React.PropTypes.object,
	featuredImage: React.PropTypes.string,
	featuredSize: React.PropTypes.object,
	onClick: React.PropTypes.func,
};
