/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import classNames from 'classnames';
import throttle from 'lodash/throttle';
import { isEqual, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Crop from './image-editor-crop';
import MediaUtils from 'lib/media/utils';
import {
	getImageEditorTransform,
	getImageEditorFileInfo
} from 'state/ui/editor/image-editor/selectors';

const MediaModalImageEditorCanvas = React.createClass( {
	displayName: 'MediaModalImageEditorCanvas',

	onWindowResize: null,

	propTypes: {
		src: React.PropTypes.string,
		mimeType: React.PropTypes.string,
		transform: React.PropTypes.shape( {
			degrees: React.PropTypes.number,
			scaleX: React.PropTypes.number,
			scaleY: React.PropTypes.number
		} ),
		onLoadError: React.PropTypes.func
	},

	getInitialState() {
		return {
			imageLoaded: false,
			crop: {
				topRatio: 0,
				leftRatio: 0,
				widthRatio: 1,
				heightRatio: 1
			}
		};
	},

	getDefaultProps() {
		return {
			transform: {
				degrees: 0,
				scaleX: 1,
				scaleY: 1
			},
			onLoadError: noop
		};
	},

	componentWillReceiveProps( newProps ) {
		this.getImage( newProps.src );
	},

	getImage( url ) {
		const { onLoadError, mimeType } = this.props;

		const req = new XMLHttpRequest();
		req.open( 'GET', url + '?', true ); // Fix #7991 by forcing Safari to ignore cache and perform valid CORS request
		req.responseType = 'arraybuffer';
		req.onload = () => {
			const objectURL = window.URL.createObjectURL( new Blob( [ req.response ], { type: mimeType } ) );
			this.initImage( objectURL );
		};

		req.onerror = error => onLoadError( error );
		req.send();
	},

	initImage( src ) {
		this.image = new Image();
		this.image.src = src;
		this.image.onload = this.onLoadComplete;
		this.image.onerror = this.onLoadComplete;
	},

	onLoadComplete( event ) {
		if ( event.type !== 'load' ) {
			return;
		}

		this.drawImage();
		this.updateCanvasPosition();
		this.onWindowResize = throttle( this.updateCanvasPosition, 200 );
		if ( typeof window !== 'undefined' ) {
			window.addEventListener( 'resize', this.onWindowResize );
		}

		this.setState( {
			imageLoaded: true
		} );
	},

	componentWillUnmount: function() {
		if ( typeof window !== 'undefined' && this.onWindowResize ) {
			window.removeEventListener( 'resize', this.onWindowResize );
			this.onWindowResize = null;
		}
	},
	componentDidUpdate( prevProps, prevState ) {
		if ( isEqual( prevState.crop, this.state.crop ) ) {
			return;
		}

		this.drawImage();
		this.updateCanvasPosition();
	},

	toBlob( callback ) {
		const canvas = ReactDom.findDOMNode( this.refs.canvas );
		const context = canvas.getContext( '2d' );
		const rotated = this.props.transform.degrees % 180 !== 0;
		const imageWidth = rotated ? this.image.height : this.image.width;
		const imageHeight = rotated ? this.image.width : this.image.height;
		const croppedLeft = this.state.crop.leftRatio * imageWidth;
		const croppedTop = this.state.crop.topRatio * imageHeight;
		const croppedWidth = this.state.crop.widthRatio * imageWidth;
		const croppedHeight = this.state.crop.heightRatio * imageHeight;
		const imageData = context.getImageData(
			croppedLeft,
			croppedTop,
			croppedWidth,
			croppedHeight );
		const newCanvas = document.createElement( 'canvas' );

		newCanvas.width = croppedWidth;
		newCanvas.height = croppedHeight;

		const newContext = newCanvas.getContext( '2d' );
		newContext.putImageData( imageData, 0, 0 );

		MediaUtils.canvasToBlob( newCanvas, callback, this.props.mimeType, 1 );
	},

	drawImage() {
		if ( ! this.image ) {
			return;
		}

		const canvas = ReactDom.findDOMNode( this.refs.canvas );
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
		context.rotate( transform.degrees * Math.PI / 180 );

		context.drawImage( this.image, -imageWidth / 2, -imageHeight / 2 );

		context.restore();
	},

	updateCanvasPosition() {
		const { crop } = this.state;

		const canvas = ReactDom.findDOMNode( this.refs.canvas );
		const canvasX = -50 * crop.widthRatio - 100 * crop.leftRatio;
		const canvasY = -50 * crop.heightRatio - 100 * crop.topRatio;

		const bounds = {
			topBound: canvas.offsetTop - canvas.offsetHeight * -canvasY / 100,
			leftBound: canvas.offsetLeft - canvas.offsetWidth * -canvasX / 100,
			bottomBound: canvas.offsetTop + canvas.offsetHeight * ( 1 + canvasY / 100 ),
			rightBound: canvas.offsetLeft + canvas.offsetWidth * ( 1 + canvasX / 100 )
		};

		this.setState( {
			bounds: bounds
		} );
	},

	onApplyCrop( crop ) {
		this.setState( {
			crop: crop
		} );
	},

	preventDrag( event ) {
		event.preventDefault();
		return false;
	},

	renderCrop() {
		return (
			<Crop
				onApplyCrop={ this.onApplyCrop }
				bounds={ this.state.bounds }
				crop={ this.state.crop } // Pass down default crop values so we don't have to duplicate them in <Crop>.
			/>
		);
	},

	render() {
		const { crop, imageLoaded } = this.state;

		const canvasX = -50 * crop.widthRatio - 100 * crop.leftRatio;
		const canvasY = -50 * crop.heightRatio - 100 * crop.topRatio;

		const canvasStyle = {
			transform: 'translate(' + canvasX + '%, ' + canvasY + '%)',
			maxWidth: ( 85 / crop.widthRatio ) + '%',
			maxHeight: ( 85 / crop.heightRatio ) + '%'
		};

		const canvasClasses = classNames( 'editor-media-modal-image-editor__canvas', {
			'is-placeholder': ! imageLoaded
		} );

		return (
			<div className="editor-media-modal-image-editor__canvas-container">
				{ imageLoaded && this.renderCrop() }
				<canvas
					ref="canvas"
					style={ canvasStyle }
					onMouseDown={ this.preventDrag }
					className={ canvasClasses } />
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const transform = getImageEditorTransform( state );
		const { src, mimeType } = getImageEditorFileInfo( state );

		return {
			src,
			mimeType,
			transform
		};
	},
	null,
	null,
	{ withRef: true }
)( MediaModalImageEditorCanvas );
