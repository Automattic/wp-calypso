/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import clone from 'lodash/clone';
import noop from 'lodash/noop';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Draggable from 'components/draggable';
import {
	getImageEditorFileInfo,
	getImageEditorAspectRatio,
	getImageEditorTransform,
	getImageEditorCrop
} from 'state/ui/editor/image-editor/selectors';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import { imageEditorCrop } from 'state/ui/editor/image-editor/actions';

const MediaModalImageEditorCrop = React.createClass( {

	propTypes: {
		transform: React.PropTypes.shape( {
			degrees: React.PropTypes.number,
			scaleX: React.PropTypes.number,
			scaleY: React.PropTypes.number
		} ),
		src: React.PropTypes.string,
		mimeType: React.PropTypes.string,
		crop: React.PropTypes.shape( {
			topRatio: React.PropTypes.number,
			leftRatio: React.PropTypes.number,
			widthRatio: React.PropTypes.number,
			heightRatio: React.PropTypes.number,
		} ),
		aspectRatio: React.PropTypes.string,
		imageEditorCrop: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			transform: {
				degrees: 0,
				scaleX: 1,
				scaleY: 1
			},
			src: null,
			imageEditorCrop: noop
		};
	},

	getInitialState() {
		return {
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			widthRatio: 1,
			heightRatio: 1,
			bounds: {
				top: 0,
				left: 0,
				bottom: 0,
				right: 0
			}
		};
	},

	componentWillReceiveProps( newProps ) {
		this.getImage( newProps.src );
		// if ( ! isEqual( this.props.bounds, newProps.bounds ) ) {
		// 	const imageWidth = newProps.bounds.rightBound - newProps.bounds.leftBound;
		// 	const imageHeight = newProps.bounds.bottomBound - newProps.bounds.topBound;
		// 	const newTop = newProps.bounds.topBound + newProps.crop.topRatio * imageHeight;
		// 	const newLeft = newProps.bounds.leftBound + newProps.crop.leftRatio * imageWidth;
		// 	const newBottom = newTop + newProps.crop.heightRatio * imageHeight;
		// 	const newRight = newLeft + newProps.crop.widthRatio * imageWidth;
		//
		// 	this.setState( {
		// 		top: newTop,
		// 		left: newLeft,
		// 		bottom: newBottom,
		// 		right: newRight
		// 	} );
		// }
		//
		// if ( this.props.aspectRatio !== newProps.aspectRatio ) {
		// 	this.updateCrop( this.getDefaultState( newProps ), newProps, this.applyCrop );
		// }
	},

	getImage( url ) {
		const { /*onLoadError,*/ mimeType } = this.props;

		const req = new XMLHttpRequest();
		req.open( 'GET', url + '?', true ); // Fix #7991 by forcing Safari to ignore cache and perform valid CORS request
		req.responseType = 'arraybuffer';
		req.onload = () => {
			const objectURL = window.URL.createObjectURL( new Blob( [ req.response ], { type: mimeType } ) );
			this.initImage( objectURL );
		};

		//req.onerror = error => onLoadError( error );
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
	},

	drawImage() {
		if ( ! this.image ) {
			return;
		}

		const canvas = ReactDom.findDOMNode( this.refs.canvas );
		const imageWidth = this.image.width;
		const imageHeight = this.image.height;
		const transform = this.props.transform;
		const context = canvas.getContext( '2d' );

		const container = this.refs.container;
		canvas.width = container.offsetWidth;
		canvas.height = container.offsetHeight;

		context.clearRect( 0, 0, canvas.width, canvas.height );
		context.save();

		context.rotate( transform.degrees * Math.PI / 180 );

		const boxWidth = this.state.right - this.state.left;
		const boxHeight = this.state.bottom - this.state.top;

		const boundsWidth = this.state.bounds.right - this.state.bounds.left;
		const boundsHeight = this.state.bounds.bottom - this.state.bounds.top;

		context.drawImage( this.image,
			imageWidth * ( ( this.state.left - this.state.bounds.left ) / boundsWidth ),
			imageHeight * ( ( this.state.top - this.state.bounds.top ) / boundsHeight ),
			imageWidth * ( boxWidth / boundsWidth ),
			imageHeight * ( boxHeight / boundsHeight ),
			this.state.left, this.state.top, boxWidth, boxHeight );

		context.restore();
	},

	updateCrop( newValues, props ) {
		props = props || this.props;

		const aspectRatio = props.aspectRatio;

		const rotated = props.transform.degrees % 180 !== 0;
		const bounds = this.state.bounds;
		const boundsWidth = bounds.right - bounds.left;
		const boundsHeight = bounds.bottom - bounds.top;
		const newState = Object.assign( {}, this.state, newValues );

		//limits the min crop to one hundredth of the original image or at least one px
		const onePx = boundsWidth / this.state.imageWidth;
		const oneHundredth = Math.min( this.state.imageWidth / 100, this.state.imageHeight / 100 ) * onePx;
		const newWidth = Math.max( 1, onePx, oneHundredth, newState.right - newState.left );
		const newHeight = Math.max( 1, onePx, oneHundredth, newState.bottom - newState.top );

		let aspectWidth, aspectHeight;

		switch ( aspectRatio ) {
			case AspectRatios.FREE:
				aspectWidth = newWidth;
				aspectHeight = newHeight;
				break;
			case AspectRatios.ORIGINAL:
				aspectWidth = boundsWidth;
				aspectHeight = boundsHeight;
				break;
			case AspectRatios.ASPECT_1X1:
				aspectWidth = 1;
				aspectHeight = 1;
				break;
			case AspectRatios.ASPECT_16X9:
				aspectWidth = rotated ? 9 : 16;
				aspectHeight = rotated ? 16 : 9;
				break;
			case AspectRatios.ASPECT_4X3:
				aspectWidth = rotated ? 3 : 4;
				aspectHeight = rotated ? 4 : 3;
				break;
			case AspectRatios.ASPECT_3X2:
				aspectWidth = rotated ? 2 : 3;
				aspectHeight = rotated ? 3 : 2;
				break;
		}

		const ratio = Math.min( newWidth / aspectWidth, newHeight / aspectHeight );
		const finalWidth = aspectWidth * ratio;
		const finalHeight = aspectHeight * ratio;

		if ( newValues.hasOwnProperty( 'top' ) ) {
			newValues.top = newState.bottom - finalHeight;
		} else if ( newValues.hasOwnProperty( 'bottom' ) ) {
			newValues.bottom = newState.top + finalHeight;
		}

		if ( newValues.hasOwnProperty( 'left' ) ) {
			newValues.left = newState.right - finalWidth;
		} else if ( newValues.hasOwnProperty( 'right' ) ) {
			newValues.right = newState.left + finalWidth;
		}

		newValues.bounds = {
			top: this.initialBoundsTop,
			left: this.initialBoundsLeft,
			right: this.initialBoundsRight,
			bottom: this.initialBoundsBottom
		};

		return newValues;
	},

	onDragStart() {
		this.initialBounds = clone( this.state.bounds );
		this.initialTop = this.state.top;
		this.initialLeft = this.state.left;
		this.initialBottom = this.state.bottom;
		this.initialRight = this.state.right;
		this.initialBoundsTop = this.state.bounds.top;
		this.initialBoundsLeft = this.state.bounds.left;
		this.initialBoundsBottom = this.state.bounds.bottom;
		this.initialBoundsRight = this.state.bounds.right;
	},

	onTopLeftDrag( x, y ) {
		const newState = this.updateCrop( {
			top: y,
			left: x
		} );

		// if ( newState.left < this.initialLeft ) {
		// 	const deltaX = newState.left - this.initialLeft;
		// 	//const deltaRight = this.state.right - this.initialRight;
		//
		// 	//newState.right = this.initialRight - deltaRight;
		// 	newState.bottom = this.initialBottom + deltaX / 2;
		// 	console.log(deltaX)
		//
		// 	newState.bounds.top -= deltaX / 2;
		// 	newState.bounds.left -= deltaX;
		// 	//newState.bounds.right -= deltaRight;
		// 	newState.bounds.bottom -= deltaX / 2;
		// }
		//
		// // if ( newState.top < this.initialTop ) {
		// // 	const deltaY = newState.top - this.initialTop;
		// // 	const deltaBottom = this.state.bottom - this.initialBottom;
		// //
		// // 	if ( newState.bottom ) {
		// // 		newState.bottom -= deltaBottom;
		// // 	} else {
		// // 		newState.bottom = this.initialBottom - deltaBottom;
		// // 	}
		// //
		// // 	if ( newState.right ) {
		// // 		newState.right -= deltaBottom;
		// // 	} else {
		// // 		newState.right = this.initialRight - deltaBottom;
		// // 	}
		// //
		// // 	newState.bounds.top -= deltaY;
		// // 	newState.bounds.bottom -= deltaBottom;
		// // }
		if ( newState.left < this.initialLeft || newState.top < this.initialTop ) {
			const deltaX = newState.left - this.initialLeft;

			newState.right = this.initialRight - deltaX;
			newState.bounds.left = this.initialBoundsLeft - deltaX;
			newState.left = Math.max( newState.bounds.left, newState.left );
			newState.bounds.right = this.initialBoundsRight - deltaX;
		} else {
			newState.right = this.initialRight;
			newState.bounds.left = this.initialBoundsLeft;
			newState.bounds.right = this.initialBoundsRight;
		}

		if ( newState.top < this.initialTop ) {
			const deltaY = newState.top - this.initialTop;

			newState.bottom = this.initialBottom - deltaY;
			newState.bounds.top = this.initialBoundsTop - deltaY;
			newState.bounds.bottom = this.initialBoundsBottom - deltaY;
		} else {
			newState.bottom = this.initialBottom;
			newState.bounds.top = this.initialBoundsTop;
			newState.bounds.bottom = this.initialBoundsBottom;
		}

		this.setState( newState, this.drawImage );
	},

	onTopRightDrag( x, y ) {
		const newState = this.updateCrop( {
			top: y,
			right: x
		} );

		if ( newState.right > this.initialRight || newState.top < this.initialTop ) {
			const deltaX = newState.right - this.initialRight;
			const deltaY = newState.top - this.initialTop;

			this.setState( {
				top: newState.top,
				left: this.initialLeft - deltaX,
				right: newState.right,
				bottom: this.initialBottom - deltaY,
				bounds: {
					top: this.initialBoundsTop - deltaY,
					left: this.initialBoundsLeft - deltaX,
					right: this.initialBoundsRight - deltaX,
					bottom: this.initialBoundsBottom - deltaY
				}
			}, this.drawImage );

			return;
		}

		this.setState( newState, this.drawImage );
	},

	onBottomRightDrag( x, y ) {
		const newState = this.updateCrop( {
			bottom: y,
			right: x
		} );

		this.setState( newState, this.drawImage );
	},

	onBottomLeftDrag( x, y ) {
		const newState = this.updateCrop( {
			bottom: y,
			left: x
		} );

		this.setState( newState, this.drawImage );
	},

	onBorderDrag( x, y, dx, dy ) {
		const boundsHeight = this.initialBounds.bottom - this.initialBounds.top;
		const boundsWidth = this.initialBounds.right - this.initialBounds.left;

		let top = Math.min( this.state.top, this.initialBounds.top + dy );
		if ( top + boundsHeight <= this.state.bottom ) {
			top = this.state.bottom - boundsHeight;
		}

		let left = Math.min( this.state.left, this.initialBounds.left + dx );
		if ( left + boundsWidth <= this.state.right ) {
			left = this.state.right - boundsWidth;
		}

		const bottom = top + boundsHeight;
		const right = left + boundsWidth;

		this.setState( {
			bounds: { top, left, bottom, right }
		}, this.drawImage );
	},

	applyCrop() {
		const container = this.refs.container;
		const containerWidth = container.offsetWidth;
		const containerHeight = container.offsetHeight;

		const boxWidth = this.state.right - this.state.left;
		const boxHeight = this.state.bottom - this.state.top;

		const ratio = Math.min( 0.85 * containerWidth / boxWidth, 0.85 * containerHeight / boxHeight );

		//1. scale
		let boundsTop = this.state.bounds.top;
		let boundsLeft = this.state.bounds.left;
		let boundsRight = boundsLeft + ( this.state.bounds.right - this.state.bounds.left ) * ratio;
		let boundsBottom = boundsTop + ( this.state.bounds.bottom - this.state.bounds.top ) * ratio;

		let boxTop = this.state.bounds.top + ( this.state.top - this.state.bounds.top ) * ratio;
		let boxLeft = this.state.bounds.left + ( this.state.left - this.state.bounds.left ) * ratio;
		let boxRight = boxLeft + boxWidth * ratio;
		let boxBottom = boxTop + boxHeight * ratio;

		//2. translate
		const deltaX = ( containerWidth / 2 - ( ratio * boxWidth ) / 2 ) - boxLeft;
		boundsLeft += deltaX;
		boundsRight += deltaX;
		boxLeft += deltaX;
		boxRight += deltaX;

		const deltaY = ( containerHeight / 2 - ( ratio * boxHeight ) / 2 ) - boxTop;
		boundsTop += deltaY;
		boundsBottom += deltaY;
		boxTop += deltaY;
		boxBottom += deltaY;

		this.animate(
			( boxTop - this.state.top ) / 30,
			( boxLeft - this.state.left ) / 30,
			( boxRight - this.state.right ) / 30,
			( boxBottom - this.state.bottom ) / 30,
			( boundsTop - this.state.bounds.top ) / 30,
			( boundsLeft - this.state.bounds.left ) / 30,
			( boundsRight - this.state.bounds.right ) / 30,
			( boundsBottom - this.state.bounds.bottom ) / 30,
			30
		);
	},

	animate( boxTopDelta, boxLeftDelta, boxRightDelta, boxBottomDelta,
		boundsTopDelta, boundsLeftDelta, boundsRightDelta, boundsBottomDelta, frames ) {

		if ( frames === 0 ) {
			return;
		}

		this.setState( {
			top: this.state.top + boxTopDelta,
			left: this.state.left + boxLeftDelta,
			right: this.state.right + boxRightDelta,
			bottom: this.state.bottom + boxBottomDelta,
			bounds: {
				top: this.state.bounds.top + boundsTopDelta,
				left: this.state.bounds.left + boundsLeftDelta,
				right: this.state.bounds.right + boundsRightDelta,
				bottom: this.state.bounds.bottom + boundsBottomDelta
			}
		}, this.drawImage );

		setTimeout( () => this.animate( boxTopDelta, boxLeftDelta, boxRightDelta, boxBottomDelta,
			boundsTopDelta, boundsLeftDelta, boundsRightDelta, boundsBottomDelta, frames - 1 ), 3 );
	},

	onBackgroundLoaded( event ) {
		const img = event.target;
		const imageWidth = img.naturalWidth;
		const imageHeight = img.naturalHeight;

		const container = this.refs.container;
		const containerWidth = container.offsetWidth;
		const containerHeight = container.offsetHeight;

		const width = Math.min( 0.85 * containerWidth, imageWidth );
		const height = Math.min( 0.85 * containerHeight, imageHeight );
		const ratio = Math.min( width / imageWidth, height / imageHeight );

		const top = containerHeight / 2 - ( ratio * imageHeight ) / 2;
		const left = containerWidth / 2 - ( ratio * imageWidth ) / 2;
		const bottom = top + ratio * imageHeight;
		const right = left + ratio * imageWidth;

		this.setState( {
			loaded: true,
			top,
			left,
			bottom,
			right,
			imageWidth,
			imageHeight,
			bounds: {
				top,
				left,
				bottom,
				right
			}
		} );
	},

	renderBackground() {
		if ( ! this.props.src ) {
			return;
		}

		const imageStyle = {};

		if ( this.state.loaded ) {
			const boundsRatio = ( this.state.bounds.right - this.state.bounds.left ) / this.state.imageWidth;
			imageStyle.transform = 'translate(' +
				this.state.bounds.left + 'px, ' +
				this.state.bounds.top + 'px) scale(' + boundsRatio + ')';
		}

		if ( false ) {
			imageStyle.display = 'none';

			return (
				<div style={ {
					position: 'absolute',
					top: this.state.bounds.top + 'px',
					left: this.state.bounds.left + 'px',
					width: ( this.state.bounds.right - this.state.bounds.left ) + 'px',
					height: ( this.state.bounds.bottom - this.state.bounds.top ) + 'px',
					background: '#5958af'
				} }>
					<img
						onLoad={ this.onBackgroundLoaded }
						src={ this.props.src }
						style={ imageStyle }
						className="editor-media-modal-image-editor__image"/>
				</div>
			);
		} else {
			return ( <img
				onLoad={ this.onBackgroundLoaded }
				src={ this.props.src }
				style={ imageStyle }
				className="editor-media-modal-image-editor__image"/> );
		}
	},

	render() {
		const { top, left, right, bottom } = this.state;
		const width = right - left;
		const height = bottom - top;
		const handleClassName = 'editor-media-modal-image-editor__crop-handle';

		return (
			<div className="editor-media-modal-image-editor__crop-container" ref="container">
				{ this.renderBackground() }
				<canvas ref="canvas" className="editor-media-modal-image-editor__canvas" />
				<Draggable
					ref="border"
					onStart={ this.onDragStart }
					onDrag={ this.onBorderDrag }
					onStop={ this.applyCrop }
					x={ left }
					y={ top }
					width={ width }
					height={ height }
					controlled
					className="editor-media-modal-image-editor__crop" />
				<Draggable
					onStart={ this.onDragStart }
					onDrag={ this.onTopLeftDrag }
					onStop={ this.applyCrop }
					x={ left }
					y={ top }
					controlled
					bounds={ { top: this.state.bounds.top - 1, left: this.state.bounds.left - 1, bottom, right } }
					ref="topLeft"
					className={ classNames( handleClassName, handleClassName + '-nwse' ) }/>
				<Draggable
					onStart={ this.onDragStart }
					onDrag={ this.onTopRightDrag }
					onStop={ this.applyCrop }
					y={ top }
					x={ right }
					controlled
					bounds={ { top: this.state.bounds.top - 1, right: this.state.bounds.right - 1, bottom, left } }
					ref="topRight"
					className={ classNames( handleClassName, handleClassName + '-nesw' ) } />
				<Draggable
					onStart={ this.onDragStart }
					onDrag={ this.onBottomRightDrag }
					onStop={ this.applyCrop }
					y={ bottom }
					x={ right }
					controlled
					bounds={ { bottom: this.state.bounds.bottom - 1, right: this.state.bounds.right - 1, top, left } }
					ref="bottomRight"
					className={ classNames( handleClassName, handleClassName + '-nwse' ) } />
				<Draggable
					onStart={ this.onDragStart }
					onDrag={ this.onBottomLeftDrag }
					onStop={ this.applyCrop }
					y={ bottom }
					x={ left }
					controlled
					bounds={ { bottom: this.state.bounds.bottom - 1, left: this.state.bounds.left - 1, top, right } }
					ref="bottomLeft"
					className={ classNames( handleClassName, handleClassName + '-nesw' ) } />
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const crop = getImageEditorCrop( state );
		const aspectRatio = getImageEditorAspectRatio( state );
		const transform = getImageEditorTransform( state );
		const { src, mimeType } = getImageEditorFileInfo( state );

		return { src, mimeType, crop, aspectRatio, transform };
	},
	{ imageEditorCrop }
)( MediaModalImageEditorCrop );
