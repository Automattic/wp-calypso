/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Crop from './image-editor-crop';
import MediaUtils from 'lib/media/utils';
import {
	getImageEditorTransform,
	getImageEditorFileInfo,
	getImageEditorCrop
} from 'state/ui/editor/image-editor/selectors';
import { setImageEditorCropBounds } from 'state/ui/editor/image-editor/actions';

const MediaModalImageEditorCanvas = React.createClass( {
	displayName: 'MediaModalImageEditorCanvas',

	propTypes: {
		src: React.PropTypes.string,
		mimeType: React.PropTypes.string,
		transfrom: React.PropTypes.shape( {
			degrees: React.PropTypes.number,
			scaleX: React.PropTypes.number,
			scaleY: React.PropTypes.number
		} ),
		crop: React.PropTypes.shape( {
			topRatio: React.PropTypes.number,
			leftRatio: React.PropTypes.number,
			widthRatio: React.PropTypes.number,
			heightRatio: React.PropTypes.number,
		} ),
		setImageEditorCropBounds: React.PropTypes.func
	},

	getDefaultProps() {
		return {
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
			setImageEditorCropBounds: noop
		};
	},

	componentWillReceiveProps( newProps ) {
		if ( this.props.src !== newProps.src ) {
			this.initImage( newProps.src );
		}
	},

	componentDidMount() {
		if ( ! this.props.src ) {
			return;
		}

		this.initImage( this.props.src );
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
	},

	componentDidUpdate() {
		this.drawImage();
		this.updateCanvasPosition();
	},

	toBlob( callback ) {
		const canvas = ReactDom.findDOMNode( this.refs.canvas );
		const context = canvas.getContext( '2d' );
		const rotated = this.props.transform.degrees % 180 !== 0;
		const imageWidth = rotated ? this.image.height : this.image.width;
		const imageHeight = rotated ? this.image.width : this.image.height;
		const croppedLeft = this.props.crop.leftRatio * imageWidth;
		const croppedTop = this.props.crop.topRatio * imageHeight;
		const croppedWidth = this.props.crop.widthRatio * imageWidth;
		const croppedHeight = this.props.crop.heightRatio * imageHeight;
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
		const canvas = ReactDom.findDOMNode( this.refs.canvas );
		const canvasX = - 50 * this.props.crop.widthRatio - 100 * this.props.crop.leftRatio;
		const canvasY = - 50 * this.props.crop.heightRatio - 100 * this.props.crop.topRatio;

		this.props.setImageEditorCropBounds(
			canvas.offsetTop - canvas.offsetHeight * -canvasY / 100,
			canvas.offsetLeft - canvas.offsetWidth * -canvasX / 100,
			canvas.offsetTop + canvas.offsetHeight * ( 1 + canvasY / 100 ),
			canvas.offsetLeft + canvas.offsetWidth * ( 1 + canvasX / 100 ) );
	},

	preventDrag( event ) {
		event.preventDefault();
		return false;
	},

	renderCrop() {
		if ( ! this.props.src ) {
			return;
		}

		return ( <Crop /> );
	},

	render() {
		const canvasX = - 50 * this.props.crop.widthRatio - 100 * this.props.crop.leftRatio;
		const canvasY = - 50 * this.props.crop.heightRatio - 100 * this.props.crop.topRatio;

		const canvasStyle = {
			transform: 'translate(' + canvasX + '%, ' + canvasY + '%)',
			maxWidth: ( 85 / this.props.crop.widthRatio ) + '%',
			maxHeight: ( 85 / this.props.crop.heightRatio ) + '%'
		};

		return (
			<div className="editor-media-modal-image-editor__canvas-container">
				{ this.renderCrop() }
				<canvas
					ref="canvas"
					style={ canvasStyle }
					onMouseDown={ this.preventDrag }
					className="editor-media-modal-image-editor__canvas" />
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const transform = getImageEditorTransform( state );
		const { src, mimeType } = getImageEditorFileInfo( state );
		const crop = getImageEditorCrop( state );

		return {
			src,
			mimeType,
			transform,
			crop
		};
	},
	{ setImageEditorCropBounds },
	null,
	{ withRef: true }
)( MediaModalImageEditorCanvas );
