/**
* External dependencies
*/
import React from 'react';
import ReactDom from 'react-dom';
import { assign, constant, throttle } from 'lodash';

/**
* Internal dependencies
**/
import EmbedHelper from 'reader/embed-helper';

const maxWidth = () => Math.min( 720, window.innerWidth );

export default class FeaturedAsset extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			suppressFeaturedImage: false,
			useFeaturedEmbed: props.useFeaturedEmbed,
			showThumbnailIfPossible: true,
		};

		[	'handleImageError',
			'updateFeatureSize',
			'getMaxFeaturedWidthSize',
			'setEmbedSizingStrategy',
			'setFeaturedImageRef',
			'setFeaturedEmbedRef',
			'handleResize',
			'handleThumbnailClick',
		].forEach( method => {
			this[ method ] = this[ method ].bind( this );
		} );

		this.setEmbedSizingStrategy( props.featuredEmbed );
		this.setImageSizingStrategy( props.featuredImage );
	}

	componentWillReceiveProps( nextProps ) {
		// if the next set of props
		if ( nextProps.featuredImage !== this.props.featuredImage ) {
			this.setState( {
				suppressFeaturedImage: false,
				useFeaturedEmbed: nextProps.useFeaturedEmbed
			} );
			this.setImageSizingStrategy( nextProps.featuredImage );
		}

		if ( nextProps.featuredEmbed !== this.props.featuredEmbed ) {
			this.setEmbedSizingStrategy( nextProps.featuredEmbed );
		}
	}

	componentWillMount() {
		this._unmounted = false;
	}

	componentWillUnmount() {
		this._unmounted = true;
		window.removeEventListener( 'resize', this._handleResize );
	}

	componentDidMount() {
		this.updateFeatureSize();
		this._handleResize = throttle( this.handleResize, 100 );
		window.addEventListener( 'resize', this._handleResize );
	}

	handleResize() {
		this.updateFeatureSize();
	}

	getMaxFeaturedWidthSize() {
		return ReactDom.findDOMNode( this ).parentNode.offsetWidth;
	}

	setEmbedSizingStrategy( featuredEmbed ) {
		let sizingFunction = constant( {} );
		if ( featuredEmbed ) {
			const embedSize = EmbedHelper.getEmbedSizingFunction( featuredEmbed );
			sizingFunction = ( available = this.getMaxFeaturedWidthSize() ) => embedSize( available );
		}
		this.getEmbedSize = sizingFunction;
	}

	setImageSizingStrategy( featuredImage ) {
		let sizingFunction = constant( {} );
		if ( featuredImage && featuredImage.width >= maxWidth() ) {
			sizingFunction = ( available = this.getMaxFeaturedWidthSize() ) => {
				const aspectRatio = featuredImage.width / featuredImage.height,
					height = `${ Math.floor( available / aspectRatio ) }px`,
					width = `${ available }px`;
				return { width, height };
			};
		}
		this.getImageSize = sizingFunction;
	}

	updateFeatureSize() {
		if ( this.featuredImageRef ) {
			const img = ReactDom.findDOMNode( this.featuredImageRef );
			assign( img.style, this.getImageSize() );
		}

		if ( this.featuredEmbedRef ) {
			const iframe = ReactDom.findDOMNode( this.featuredEmbedRef ).querySelector( 'iframe' );
			assign( iframe.style, this.getEmbedSize() );
		}
	}

	handleImageError() {
		// You might be wondering, if the src of the img tag below changes while the image is loading, what happens?
		// Does error fire and then the new load start? Does the error get suppressed?
		// It appears that any events tied to a loading image are swallowed if the src changes. See
		// http://jsbin.com/merulogozu/edit?js,console for a test of changing the src after the image starts to load
		if ( ! this._unmounted ) {
			this.setState( {
				suppressFeaturedImage: true,
				useFeaturedEmbed: !! this.props.featuredEmbed // turn on the featured embed if it exists
			} );
		}
	}

	handleThumbnailClick( e ) {
		e.preventDefault();
		this.setState( { showThumbnailIfPossible: false }, () => this.updateFeatureSize() );
	}

	setFeaturedImageRef( c ) {
		this.featuredImageRef = c;
	}

	setFeaturedEmbedRef( c ) {
		this.featuredEmbedRef = c;
	}

	render() {
		if ( this.state.useFeaturedEmbed ) {
			if ( this.state.showThumbnailIfPossible && this.props.featuredEmbed.thumbnailUrl ) {
				return (
					<div className="reader__post-featured-video"
						key="featuredVideo"
						onClick={ this.handleThumbnailClick }
					>
						<div className="reader__post-play-icon-container">
							<img src={ this.props.featuredEmbed.thumbnailUrl } className="reader__post-featured-video-thumbnail" />
							<img className="reader__post-play-icon" src="/calypso/images/reader/play-icon.png" />
						</div>
					</div>   //eslint-disable-line react/no-danger
				);
			}
			const featuredEmbed = this.props.featuredEmbed;
			const iframe = featuredEmbed.thumbnailUrl ? featuredEmbed.autoplayIframe : featuredEmbed.iframe;

			return (
				<div ref={ this.setFeaturedEmbedRef }
					className="reader__post-featured-video"
					key="featuredVideo"
					dangerouslySetInnerHTML={ { __html: iframe } } />   //eslint-disable-line react/no-danger
			);
		}

		return (
			<div
				className="reader__post-featured-image" >
				{
				! this.state.suppressFeaturedImage
				? <img className="reader__post-featured-image-image"
						ref={ this.setFeaturedImageRef }
						src={ this.props.featuredImage.uri }
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
	featuredImage: React.PropTypes.object,
	useFeaturedEmbed: React.PropTypes.bool,
};
