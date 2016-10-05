/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { isEqual, noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Draggable from 'components/draggable';
import {
	getImageEditorCropBounds,
	getImageEditorAspectRatio,
	getImageEditorTransform,
	getImageEditorCrop
} from 'state/ui/editor/image-editor/selectors';
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import { imageEditorCrop } from 'state/ui/editor/image-editor/actions';

class ImageEditorCrop extends Component {
	static propTypes = {
		degrees: PropTypes.number,
		bounds: PropTypes.shape( {
			topBound: PropTypes.number,
			leftBound: PropTypes.number,
			bottomBound: PropTypes.number,
			rightBound: PropTypes.number
		} ),
		crop: PropTypes.shape( {
			topRatio: PropTypes.number,
			leftRatio: PropTypes.number,
			widthRatio: PropTypes.number,
			heightRatio: PropTypes.number
		} ),
		aspectRatio: PropTypes.string,
		imageEditorCrop: PropTypes.func,
		minCropSize: PropTypes.shape( {
			width: PropTypes.number,
			height: PropTypes.number
		} )
	};

	static defaultProps = {
		degrees: 0,
		bounds: {
			topBound: 0,
			leftBound: 0,
			bottomBound: 100,
			rightBound: 100
		},
		imageEditorCrop: noop,
		minCropSize: {
			width: 50,
			height: 50
		}
	};

	constructor( props ) {
		super( props );

		this.state = this.getDefaultState( props );
	}

	getDefaultState( props ) {
		return {
			top: props.bounds.topBound,
			left: props.bounds.leftBound,
			bottom: props.bounds.bottomBound,
			right: props.bounds.rightBound
		};
	}

	componentWillReceiveProps( newProps ) {
		const {
			bounds,
			aspectRatio
		} = this.props;

		if ( ! isEqual( bounds, newProps.bounds ) ) {
			const imageWidth = newProps.bounds.rightBound - newProps.bounds.leftBound;
			const imageHeight = newProps.bounds.bottomBound - newProps.bounds.topBound;
			const newTop = newProps.bounds.topBound + newProps.crop.topRatio * imageHeight;
			const newLeft = newProps.bounds.leftBound + newProps.crop.leftRatio * imageWidth;
			const newBottom = newTop + newProps.crop.heightRatio * imageHeight;
			const newRight = newLeft + newProps.crop.widthRatio * imageWidth;

			this.setState( {
				top: newTop,
				left: newLeft,
				bottom: newBottom,
				right: newRight
			} );
		}

		if ( aspectRatio !== newProps.aspectRatio ) {
			this.updateCrop( this.getDefaultState( newProps ), newProps, this.applyCrop );
		}
	}

	updateCrop( newValues, props, callback ) {
		props = props || this.props;

		const aspectRatio = props.aspectRatio;

		if ( aspectRatio === AspectRatios.FREE ) {
			this.setState( newValues, callback );

			return;
		}

		const rotated = props.degrees % 180 !== 0,
			bounds = props.bounds,
			newState = Object.assign( {}, this.state, newValues ),
			newWidth = newState.right - newState.left,
			newHeight = newState.bottom - newState.top;

		let imageWidth,
			imageHeight,
			finalWidth = newWidth,
			finalHeight = newHeight;

		switch ( aspectRatio ) {
			case AspectRatios.ORIGINAL:
				imageWidth = bounds.rightBound - bounds.leftBound;
				imageHeight = bounds.bottomBound - bounds.topBound;

				break;

			case AspectRatios.ASPECT_1X1:
				imageWidth = 1;
				imageHeight = 1;

				break;

			case AspectRatios.ASPECT_16X9:
				imageWidth = rotated ? 9 : 16;
				imageHeight = rotated ? 16 : 9;

				break;

			case AspectRatios.ASPECT_4X3:
				imageWidth = rotated ? 3 : 4;
				imageHeight = rotated ? 4 : 3;

				break;

			case AspectRatios.ASPECT_3X2:
				imageWidth = rotated ? 2 : 3;
				imageHeight = rotated ? 3 : 2;

				break;
		}

		const ratio = Math.min( newWidth / imageWidth, newHeight / imageHeight );

		finalWidth = imageWidth * ratio;
		finalHeight = imageHeight * ratio;

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

		this.setState( newValues, callback );
	}

	onTopLeftDrag( x, y ) {
		const { right, bottom } = this.state;
		const { minCropSize } = this.props;

		let top = y,
			left = x;

		if ( right - left <= minCropSize.width	) {
			left = right - minCropSize.width;
		}

		if ( bottom - top <= minCropSize.height ) {
			top = bottom - minCropSize.height;
		}

		this.updateCrop( {
			top,
			left
		} );
	}

	onTopRightDrag( x, y ) {
		const { left, bottom } = this.state;
		const { minCropSize } = this.props;

		let top = y,
			right = x;

		if ( right - left <= minCropSize.width	) {
			right = left + minCropSize.width;
		}

		if ( bottom - top <= minCropSize.height ) {
			top = bottom - minCropSize.height;
		}

		this.updateCrop( {
			top,
			right
		} );
	}

	onBottomRightDrag( x, y ) {
		const { left, top } = this.state;
		const { minCropSize } = this.props;

		let bottom = y,
			right = x;

		if ( right - left <= minCropSize.width	) {
			right = left + minCropSize.width;
		}

		if ( bottom - top <= minCropSize.height ) {
			bottom = top + minCropSize.height;
		}

		this.updateCrop( {
			bottom,
			right
		} );
	}

	onBottomLeftDrag( x, y ) {
		const { right, top } = this.state;
		const { minCropSize } = this.props;

		let bottom = y,
			left = x;

		if ( right - left <= minCropSize.width	) {
			left = right - minCropSize.width;
		}

		if ( bottom - top <= minCropSize.height ) {
			bottom = top + minCropSize.height;
		}

		this.updateCrop( {
			bottom,
			left
		} );
	}

	onBorderDrag( x, y ) {
		const { top, left, right, bottom } = this.state,
			width = right - left,
			height = bottom - top;

		this.setState( {
			top: y,
			left: x,
			bottom: y + height,
			right: x + width
		} );
	}

	applyCrop() {
		const {
			top,
			left,
			right,
			bottom
		} = this.state;

		const {
			topBound,
			leftBound,
			rightBound,
			bottomBound
		} = this.props.bounds;

		const currentTop = top - topBound,
			currentLeft = left - leftBound,
			currentWidth = right - left,
			currentHeight = bottom - top,
			imageWidth = rightBound - leftBound,
			imageHeight = bottomBound - topBound;

		this.props.imageEditorCrop(
			currentTop / imageHeight,
			currentLeft / imageWidth,
			currentWidth / imageWidth,
			currentHeight / imageHeight
		);
	}

	render() {
		const {
			top,
			left,
			right,
			bottom
		} = this.state;

		const width = right - left,
			height = bottom - top,
			handleClassName = 'editor-media-modal-image-editor__crop-handle';

		const {
			topBound,
			leftBound,
			rightBound,
			bottomBound
		} = this.props.bounds;

		return (
			<div>
				<div
					className="editor-media-modal-image-editor__crop-background"
					style={ {
						top: topBound + 'px',
						left: left + 'px',
						width: width + 'px',
						height: Math.max( 0, top - topBound ) + 'px'
					} }
				/>
				<div
					className="editor-media-modal-image-editor__crop-background"
					style={ {
						top: topBound + 'px',
						left: leftBound + 'px',
						width: Math.max( 0, left - leftBound ) + 'px',
						height: Math.max( 0, bottomBound - topBound ) + 'px'
					} }
				/>
				<div
					className="editor-media-modal-image-editor__crop-background"
					style={ {
						top: bottom + 'px',
						left: left + 'px',
						width: width + 'px',
						height: Math.max( 0, bottomBound - bottom ) + 'px'
					} }
				/>
				<div
					className="editor-media-modal-image-editor__crop-background"
					style={ {
						top: topBound + 'px',
						left: right + 'px',
						width: Math.max( 0, rightBound - right ) + 'px',
						height: Math.max( 0, bottomBound - topBound ) + 'px'
					} }
				/>
				<Draggable
					ref="border"
					onDrag={ this.onBorderDrag }
					onStop={ this.applyCrop }
					x={ left }
					y={ top }
					width={ width }
					height={ height }
					bounds={ {
						top: topBound,
						left: leftBound,
						bottom: bottomBound,
						right: rightBound
					} }
					className="editor-media-modal-image-editor__crop"
				/>
				<Draggable
					onDrag={ this.onTopLeftDrag }
					onStop={ this.applyCrop }
					x={ left }
					y={ top }
					controlled
					bounds={ {
						bottom,
						right,
						top: topBound - 1,
						left: leftBound - 1
					} }
					ref="topLeft"
					className={ classNames( handleClassName, handleClassName + '-nwse' ) }
				/>
				<Draggable
					onDrag={ this.onTopRightDrag }
					onStop={ this.applyCrop }
					y={ top }
					x={ right }
					controlled
					bounds={ {
						bottom,
						left,
						top: topBound - 1,
						right: rightBound - 1
					} }
					ref="topRight"
					className={ classNames( handleClassName, handleClassName + '-nesw' ) }
				/>
				<Draggable
					onDrag={ this.onBottomRightDrag }
					onStop={ this.applyCrop }
					y={ bottom }
					x={ right }
					controlled
					bounds={ {
						top,
						left,
						bottom: bottomBound - 1,
						right: rightBound - 1
					} }
					ref="bottomRight"
					className={ classNames( handleClassName, handleClassName + '-nwse' ) }
				/>
				<Draggable
					onDrag={ this.onBottomLeftDrag }
					onStop={ this.applyCrop }
					y={ bottom }
					x={ left }
					controlled
					bounds={ {
						top,
						right,
						bottom: bottomBound - 1,
						left: leftBound - 1
					} }
					ref="bottomLeft"
					className={ classNames( handleClassName, handleClassName + '-nesw' ) }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const bounds = getImageEditorCropBounds( state );
		const crop = getImageEditorCrop( state );
		const aspectRatio = getImageEditorAspectRatio( state );
		const { degrees } = getImageEditorTransform( state );

		return {
			bounds,
			crop,
			aspectRatio,
			degrees
		};
	},
	{
		imageEditorCrop
	}
)( ImageEditorCrop );
