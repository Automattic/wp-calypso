import clsx from 'clsx';
import PropTypes from 'prop-types';
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import { getAtomicSiteMediaViaProxyRetry } from 'calypso/lib/get-atomic-site-media';
import { mediaURLToProxyConfig, canvasToBlob } from 'calypso/lib/media/utils';
import {
	setImageEditorCropBounds,
	setImageEditorImageHasLoaded,
} from 'calypso/state/editor/image-editor/actions';
import {
	getImageEditorTransform,
	getImageEditorFileInfo,
	getImageEditorCrop,
	isImageEditorImageLoaded,
} from 'calypso/state/editor/image-editor/selectors';
import getImageEditorIsGreaterThanMinimumDimensions from 'calypso/state/selectors/get-image-editor-is-greater-than-minimum-dimensions';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import ImageEditorCrop from './image-editor-crop';

const noop = () => {};

export class ImageEditorCanvas extends Component {
	static propTypes = {
		src: PropTypes.string,
		mimeType: PropTypes.string,
		transform: PropTypes.shape( {
			degrees: PropTypes.number,
			scaleX: PropTypes.number,
			scaleY: PropTypes.number,
		} ),
		crop: PropTypes.shape( {
			topRatio: PropTypes.number,
			leftRatio: PropTypes.number,
			widthRatio: PropTypes.number,
			heightRatio: PropTypes.number,
		} ),
		setImageEditorCropBounds: PropTypes.func,
		setImageEditorImageHasLoaded: PropTypes.func,
		onLoadError: PropTypes.func,
		isImageLoaded: PropTypes.bool,
		showCrop: PropTypes.bool,
		widthLimit: PropTypes.number,
	};

	static defaultProps = {
		transform: {
			degrees: 0,
			scaleX: 1,
			scaleY: 1,
		},
		crop: {
			cropTopRatio: 0,
			cropLeftRatio: 0,
			cropWidthRatio: 1,
			cropHeightRatio: 1,
		},
		setImageEditorCropBounds: noop,
		setImageEditorImageHasLoaded: noop,
		onLoadError: noop,
		isImageLoaded: false,
		showCrop: true,
		widthLimit: Infinity,
	};

	// throttle the frame rate of window.resize() to circa 30fps
	frameRateInterval = 1000 / 30;
	requestAnimationFrameId = null;
	lastTimestamp = null;
	isMounted = false;
	canvasRef = createRef();

	onWindowResize = () => {
		this.requestAnimationFrameId = window.requestAnimationFrame( this.updateCanvasPosition );
	};

	componentDidMount() {
		this.isMounted = true;
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.src !== prevProps.src || ! this.image ) {
			this.getImage( this.props.src );
		}

		this.drawImage();
		this.updateCanvasPosition();
	}

	componentWillUnmount() {
		if ( typeof window !== 'undefined' && this.onWindowResize ) {
			window.removeEventListener( 'resize', this.onWindowResize );
			window.cancelAnimationFrame( this.requestAnimationFrameId );
		}

		this.isMounted = false;
	}

	fetchImageBlob( src ) {
		const { siteSlug, isJetpackNonAtomic } = this.props;
		const { filePath, query, isRelativeToSiteRoot } = mediaURLToProxyConfig( src, siteSlug );
		const useProxy = ! isJetpackNonAtomic && !! filePath && isRelativeToSiteRoot;

		if ( useProxy ) {
			return getAtomicSiteMediaViaProxyRetry( siteSlug, filePath, { query } );
		}

		if ( ! src.startsWith( 'blob' ) && ! src.startsWith( 'data' ) ) {
			src = src + '?'; // Fix #7991 by forcing Safari to ignore cache and perform valid CORS request
		}

		return window.fetch( src ).then( ( response ) => response.blob() );
	}

	getImage( src ) {
		this.fetchImageBlob( src )
			.then( ( blob ) => {
				if ( this.isMounted ) {
					this.initImage( window.URL.createObjectURL( blob ) );
				}
			} )
			.catch( ( error ) => {
				if ( this.isMounted ) {
					this.props.onLoadError( error );
				}
			} );
	}

	initImage( src ) {
		this.image = new Image();
		this.image.src = src;
		this.image.onload = this.onLoadComplete;
		this.image.onerror = this.onLoadComplete;
	}

	onLoadComplete = ( event ) => {
		if ( event.type !== 'load' || ! this.isMounted ) {
			return;
		}

		this.drawImage();
		this.updateCanvasPosition();

		if ( typeof window !== 'undefined' ) {
			this.lastTimestamp = window.performance.now();
			window.addEventListener( 'resize', this.onWindowResize );
		}

		this.props.setImageEditorImageHasLoaded( this.image.width, this.image.height );
	};

	toBlob( callback ) {
		const { widthLimit } = this.props;
		const { leftRatio, topRatio, widthRatio, heightRatio } = this.props.crop;

		const { mimeType, transform } = this.props;

		const canvas = this.canvasRef.current;
		const context = canvas.getContext( '2d' );
		const rotated = transform.degrees % 180 !== 0;
		const imageWidth = rotated ? this.image.height : this.image.width;
		const imageHeight = rotated ? this.image.width : this.image.height;
		const croppedLeft = leftRatio * imageWidth;
		const croppedTop = topRatio * imageHeight;
		const croppedWidth = widthRatio * imageWidth;
		const croppedHeight = heightRatio * imageHeight;

		const imageData = context.getImageData( croppedLeft, croppedTop, croppedWidth, croppedHeight );

		const newCanvas = document.createElement( 'canvas' );

		newCanvas.width = croppedWidth;
		newCanvas.height = croppedHeight;

		const newContext = newCanvas.getContext( '2d' );
		newContext.putImageData( imageData, 0, 0 );

		if ( Number.isFinite( widthLimit ) && widthLimit < croppedWidth ) {
			const resizedCanvas = document.createElement( 'canvas' );
			const scale = widthLimit / croppedWidth;
			resizedCanvas.width = scale * croppedHeight;
			resizedCanvas.height = scale * croppedWidth;
			const resizedContext = resizedCanvas.getContext( '2d' );
			resizedContext.drawImage( newCanvas, 0, 0, scale * croppedWidth, scale * croppedHeight );
			canvasToBlob( resizedCanvas, callback, mimeType, 1 );
		} else {
			canvasToBlob( newCanvas, callback, mimeType, 1 );
		}
	}

	drawImage() {
		if ( ! this.image ) {
			return;
		}

		const canvas = this.canvasRef.current;
		const imageWidth = this.image.width;
		const imageHeight = this.image.height;
		const transform = this.props.transform;
		const rotated = transform.degrees % 180 !== 0;

		//make sure the canvas draw area is the same size as the image
		canvas.width = rotated ? imageHeight : imageWidth;
		canvas.height = rotated ? imageWidth : imageHeight;

		const context = canvas.getContext( '2d' );

		context.clearRect( 0, 0, canvas.width, canvas.height );
		context.save();

		// setTransform() could be replaced with translate(), but it leads to
		// a false positive warning from eslint rule wpcalypso/i18n-no-variables
		context.setTransform( 1, 0, 0, 1, canvas.width / 2, canvas.height / 2 );

		context.scale( transform.scaleX, transform.scaleY );
		context.rotate( ( transform.degrees * Math.PI ) / 180 );

		context.drawImage( this.image, -imageWidth / 2, -imageHeight / 2 );

		context.restore();
	}

	updateCanvasPosition = ( timestamp ) => {
		const now = timestamp;
		const elapsedTime = now - this.lastTimestamp;

		if ( elapsedTime < this.frameRateInterval ) {
			return;
		}

		// if enough time has passed to call the next frame
		// reset lastTimeStamp minus 1 frame in ms ( to adjust for frame rates other than 60fps )
		this.lastTimestamp = now - ( elapsedTime % this.frameRateInterval );

		const { leftRatio, topRatio, widthRatio, heightRatio } = this.props.crop;

		const canvas = this.canvasRef.current;
		const canvasX = -50 * widthRatio - 100 * leftRatio;
		const canvasY = -50 * heightRatio - 100 * topRatio;

		const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = canvas;

		this.props.setImageEditorCropBounds(
			offsetTop - ( offsetHeight * -canvasY ) / 100,
			offsetLeft - ( offsetWidth * -canvasX ) / 100,
			offsetTop + offsetHeight * ( 1 + canvasY / 100 ),
			offsetLeft + offsetWidth * ( 1 + canvasX / 100 )
		);
	};

	preventDrag( event ) {
		event.preventDefault();

		return false;
	}

	render() {
		const { leftRatio, topRatio, widthRatio, heightRatio } = this.props.crop;

		const { isImageLoaded, showCrop } = this.props;

		const canvasX = -50 * widthRatio - 100 * leftRatio;
		const canvasY = -50 * heightRatio - 100 * topRatio;

		const canvasStyle = {
			transform: 'translate(' + canvasX + '%, ' + canvasY + '%)',
			maxWidth: 85 / widthRatio + '%',
			maxHeight: 85 / heightRatio + '%',
		};

		const canvasClasses = clsx( 'image-editor__canvas', {
			'is-placeholder': ! isImageLoaded,
		} );

		return (
			<div className="image-editor__canvas-container">
				<canvas
					ref={ this.canvasRef }
					style={ canvasStyle }
					onMouseDown={ this.preventDrag }
					className={ canvasClasses }
				/>
				{ showCrop && <ImageEditorCrop /> }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSelectedSiteSlug( state );
		const isJetpackNonAtomic = isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } );

		const transform = getImageEditorTransform( state );
		const { src, mimeType } = getImageEditorFileInfo( state );
		const crop = getImageEditorCrop( state );
		const isImageLoaded = isImageEditorImageLoaded( state );
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions( state );

		return {
			siteSlug,
			isJetpackNonAtomic,
			src,
			mimeType,
			transform,
			crop,
			isImageLoaded,
			showCrop: !! ( isImageLoaded && isGreaterThanMinimumDimensions ),
		};
	},
	{
		setImageEditorCropBounds,
		setImageEditorImageHasLoaded,
	},
	null,
	{ forwardRef: true }
)( ImageEditorCanvas );
