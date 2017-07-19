/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { noop, startsWith } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ImageEditorCrop from './image-editor-crop';
import MediaUtils from 'lib/media/utils';
import {
	getImageEditorTransform,
	getImageEditorFileInfo,
	getImageEditorCrop,
	isImageEditorImageLoaded,
	getImageMeetsMinimumDimensions
} from 'state/ui/editor/image-editor/selectors';
import {
	setImageEditorCropBounds,
	setImageEditorImageHasLoaded
} from 'state/ui/editor/image-editor/actions';

class ImageEditorCanvas extends Component {
	static propTypes = {
		src: PropTypes.string,
		mimeType: PropTypes.string,
		transform: PropTypes.shape( {
			degrees: PropTypes.number,
			scaleX: PropTypes.number,
			scaleY: PropTypes.number
		} ),
		crop: PropTypes.shape( {
			topRatio: PropTypes.number,
			leftRatio: PropTypes.number,
			widthRatio: PropTypes.number,
			heightRatio: PropTypes.number
		} ),
		setImageEditorCropBounds: PropTypes.func,
		setImageEditorImageHasLoaded: PropTypes.func,
		onLoadError: PropTypes.func,
		isImageLoaded: PropTypes.bool,
		imageMeetsMinimumDimensions: PropTypes.bool
	};

	static defaultProps = {
		transform: {
			degrees: 0,
			scaleX: 1,
			scaleY: 1
		},
		crop: {
			cropTopRatio: 0,
			cropLeftRatio: 0,
			cropWidthRatio: 1,
			cropHeightRatio: 1
		},
		setImageEditorCropBounds: noop,
		setImageEditorImageHasLoaded: noop,
		onLoadError: noop,
		isImageLoaded: false,
		imageMeetsMinimumDimensions: false
	};

	// throttle the frame rate of window.resize() to circa 30fps
	frameRateInterval = 1000 / 30;
	requestAnimationFrameId = null;
	lastTimestamp = null;

	onWindowResize = () => {
		this.requestAnimationFrameId = window.requestAnimationFrame( this.updateCanvasPosition );
	};

	constructor( props ) {
		super( props );
		this.onLoadComplete = this.onLoadComplete.bind( this );
		this.updateCanvasPosition = this.updateCanvasPosition.bind( this );
		this.isVisible = false;
	}

	componentDidMount() {
		this.isVisible = true;
	}

	componentWillReceiveProps( newProps ) {
		if ( this.props.src !== newProps.src ) {
			this.getImage( newProps.src );
		}
	}

	isBlobSrc( src ) {
		return startsWith( src, 'blob' );
	}

	getImage( src ) {
		const { onLoadError, mimeType } = this.props;

		const req = new XMLHttpRequest();

		if ( ! this.isBlobSrc( src ) ) {
			src = src + '?'; // Fix #7991 by forcing Safari to ignore cache and perform valid CORS request
		}

		req.open( 'GET', src, true );
		req.responseType = 'arraybuffer';

		req.onload = () => {
			if ( ! this.isVisible ) {
				return;
			}

			const objectURL = window.URL.createObjectURL( new Blob( [ req.response ], { type: mimeType } ) );
			this.initImage( objectURL );
		};

		req.onerror = error => onLoadError( error );
		req.send();
	}

	initImage( src ) {
		this.image = new Image();
		this.image.src = src;
		this.image.onload = this.onLoadComplete;
		this.image.onerror = this.onLoadComplete;
	}

	onLoadComplete( event ) {
		if ( event.type !== 'load' || ! this.isVisible ) {
			return;
		}

		this.drawImage();
		this.updateCanvasPosition();

		if ( typeof window !== 'undefined' ) {
			this.lastTimestamp = window.performance.now();
			window.addEventListener( 'resize', this.onWindowResize );
		}

		this.props.setImageEditorImageHasLoaded( this.image.width, this.image.height );
	}

	componentWillUnmount() {
		if ( typeof window !== 'undefined' && this.onWindowResize ) {
			window.removeEventListener( 'resize', this.onWindowResize );
			window.cancelAnimationFrame( this.requestAnimationFrameId );
		}

		this.isVisible = false;
	}

	componentDidUpdate() {
		this.drawImage();
		this.updateCanvasPosition();
	}

	toBlob( callback ) {
		const {
			leftRatio,
			topRatio,
			widthRatio,
			heightRatio
		} = this.props.crop;

		const {
			mimeType,
			transform
		} = this.props;

		const canvas = ReactDom.findDOMNode( this.refs.canvas ),
			context = canvas.getContext( '2d' ),
			rotated = transform.degrees % 180 !== 0,
			imageWidth = rotated ? this.image.height : this.image.width,
			imageHeight = rotated ? this.image.width : this.image.height,
			croppedLeft = leftRatio * imageWidth,
			croppedTop = topRatio * imageHeight,
			croppedWidth = widthRatio * imageWidth,
			croppedHeight = heightRatio * imageHeight;

		const imageData = context.getImageData(
			croppedLeft,
			croppedTop,
			croppedWidth,
			croppedHeight
		);

		const newCanvas = document.createElement( 'canvas' );

		newCanvas.width = croppedWidth;
		newCanvas.height = croppedHeight;

		const newContext = newCanvas.getContext( '2d' );
		newContext.putImageData( imageData, 0, 0 );

		MediaUtils.canvasToBlob( newCanvas, callback, mimeType, 1 );
	}

	drawImage() {
		if ( ! this.image ) {
			return;
		}

		const canvas = ReactDom.findDOMNode( this.refs.canvas ),
			imageWidth = this.image.width,
			imageHeight = this.image.height,
			transform = this.props.transform,
			rotated = transform.degrees % 180 !== 0;

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
		context.rotate( transform.degrees * Math.PI / 180 );

		context.drawImage( this.image, -imageWidth / 2, -imageHeight / 2 );

		context.restore();
	}

	updateCanvasPosition( timestamp ) {
		const now = timestamp,
			elapsedTime = now - this.lastTimestamp;

		if ( elapsedTime < this.frameRateInterval ) {
			return;
		}

		// if enough time has passed to call the next frame
		// reset lastTimeStamp minus 1 frame in ms ( to adjust for frame rates other than 60fps )
		this.lastTimestamp = now - ( elapsedTime % this.frameRateInterval );

		const {
			leftRatio,
			topRatio,
			widthRatio,
			heightRatio
		} = this.props.crop;

		const canvas = ReactDom.findDOMNode( this.refs.canvas ),
			canvasX = -50 * widthRatio - 100 * leftRatio,
			canvasY = -50 * heightRatio - 100 * topRatio;

		const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = canvas;

		this.props.setImageEditorCropBounds(
			offsetTop - offsetHeight * -canvasY / 100,
			offsetLeft - offsetWidth * -canvasX / 100,
			offsetTop + offsetHeight * ( 1 + canvasY / 100 ),
			offsetLeft + offsetWidth * ( 1 + canvasX / 100 )
		);
	}

	preventDrag( event ) {
		event.preventDefault();

		return false;
	}

	render() {
		const {
			leftRatio,
			topRatio,
			widthRatio,
			heightRatio
		} = this.props.crop;

		const {
			isImageLoaded,
			imageMeetsMinimumDimensions
		} = this.props;

		const canvasX = -50 * widthRatio - 100 * leftRatio;
		const canvasY = -50 * heightRatio - 100 * topRatio;

		const canvasStyle = {
			transform: 'translate(' + canvasX + '%, ' + canvasY + '%)',
			maxWidth: ( 85 / widthRatio ) + '%',
			maxHeight: ( 85 / heightRatio ) + '%'
		};

		const canvasClasses = classNames( 'image-editor__canvas', {
			'is-placeholder': ! isImageLoaded
		} );

		return (
			<div className="image-editor__canvas-container">
				<canvas
					ref="canvas"
					style={ canvasStyle }
					onMouseDown={ this.preventDrag }
					className={ canvasClasses }
				/>
				{ isImageLoaded && imageMeetsMinimumDimensions
					? <ImageEditorCrop />
				: null }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const transform = getImageEditorTransform( state );
		const { src, mimeType } = getImageEditorFileInfo( state );
		const crop = getImageEditorCrop( state );
		const isImageLoaded = isImageEditorImageLoaded( state );
		const imageMeetsMinimumDimensions = getImageMeetsMinimumDimensions( state );

		return {
			src,
			mimeType,
			transform,
			crop,
			isImageLoaded,
			imageMeetsMinimumDimensions
		};
	},
	{
		setImageEditorCropBounds,
		setImageEditorImageHasLoaded
	},
	null,
	{ withRef: true }
)( ImageEditorCanvas );
