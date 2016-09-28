/**
* External dependencies
*/
import React from 'react';

export default class FeaturedAsset extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			suppressFeaturedImage: false,
			useFeaturedEmbed: props.useFeaturedEmbed
		};
		[ 'handleImageError' ].forEach( method => {
			this[ method ] = this[ method ].bind( this );
		} );
	}

	componentWillReceiveProps( nextProps ) {
		// if the next set of props
		if ( nextProps.featuredImage !== this.props.featuredImage ) {
			this.setState( {
				suppressFeaturedImage: false,
				useFeaturedEmbed: nextProps.useFeaturedEmbed
			} );
		}
	}

	componentWillMount() {
		this._unmounted = false;
	}

	componentWillUnmount() {
		this._unmounted = true;
	}

	handleImageError() {
		// You might be wondering, if the src of the img tag below changes while the image is loading, what happens?
		// Does error fire and then the new load start? Does the error get suppressed?
		// It appears that any events tied to a loading image are swallowed if the src changes. See
		// http://jsbin.com/merulogozu/edit?js,console for a test of changing the src after the image starts to load
		if ( ! this._umounted ) {
			this.setState( {
				suppressFeaturedImage: true,
				useFeaturedEmbed: !! this.props.featuredEmbed // turn on the featured embed if it exists
			} );
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
				className="reader__post-featured-image" >
				{
				! this.state.suppressFeaturedImage
				? <img className="reader__post-featured-image-image"
						ref="featuredImage"
						src={ this.props.featuredImage }
						onError={ this.handleImageError }
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
	useFeaturedEmbed: React.PropTypes.bool,
};
