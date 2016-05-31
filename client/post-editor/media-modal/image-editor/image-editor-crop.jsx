/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
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

const MediaModalImageEditorCrop = React.createClass( {

	propTypes: {
		degrees: React.PropTypes.number,
		bounds: React.PropTypes.shape( {
			topBound: React.PropTypes.number,
			leftBound: React.PropTypes.number,
			bottomBound: React.PropTypes.number,
			rightBound: React.PropTypes.number,
		} ),
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
			degrees: 0,
			bounds: {
				topBound: 0,
				leftBound: 0,
				bottomBound: 100,
				rightBound: 100,
			},
			imageEditorCrop: noop
		};
	},

	getInitialState() {
		return this.getDefaultState( this.props );
	},

	getDefaultState( props ) {
		return {
			top: props.bounds.topBound,
			left: props.bounds.leftBound,
			bottom: props.bounds.bottomBound,
			right: props.bounds.rightBound
		};
	},

	componentWillReceiveProps( newProps ) {
		if ( ! isEqual( this.props.bounds, newProps.bounds ) ) {
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

		if ( this.props.aspectRatio !== newProps.aspectRatio ) {
			this.updateCrop( this.getDefaultState( newProps ), newProps, this.applyCrop );
		}
	},

	updateCrop( newValues, props, callback ) {
		props = props || this.props;

		const aspectRatio = props.aspectRatio;

		if ( aspectRatio === AspectRatios.FREE ) {
			this.setState( newValues, callback );
			return;
		}

		const rotated = props.degrees % 180 !== 0;
		const bounds = props.bounds;
		const newState = Object.assign( {}, this.state, newValues );
		const newWidth = newState.right - newState.left;
		const newHeight = newState.bottom - newState.top;
		let ratio,
			finalWidth = newWidth,
			finalHeight = newHeight,
			imageWidth, imageHeight;

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

		ratio = Math.min( newWidth / imageWidth, newHeight / imageHeight );
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
	},

	onTopLeftDrag( x, y ) {
		this.updateCrop( {
			top: y,
			left: x
		} );
	},

	onTopRightDrag( x, y ) {
		this.updateCrop( {
			top: y,
			right: x
		} );
	},

	onBottomRightDrag( x, y ) {
		this.updateCrop( {
			bottom: y,
			right: x
		} );
	},

	onBottomLeftDrag( x, y ) {
		this.updateCrop( {
			bottom: y,
			left: x
		} );
	},

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
	},

	applyCrop() {
		const currentTop = this.state.top - this.props.bounds.topBound;
		const currentLeft = this.state.left - this.props.bounds.leftBound;
		const currentWidth = this.state.right - this.state.left;
		const currentHeight = this.state.bottom - this.state.top;
		const imageWidth = this.props.bounds.rightBound - this.props.bounds.leftBound;
		const imageHeight = this.props.bounds.bottomBound - this.props.bounds.topBound;

		this.props.imageEditorCrop(
			currentTop / imageHeight,
			currentLeft / imageWidth,
			currentWidth / imageWidth,
			currentHeight / imageHeight );
	},

	render() {
		const { top, left, right, bottom } = this.state;
		const width = right - left;
		const height = bottom - top;
		const handleClassName = 'editor-media-modal-image-editor__crop-handle';

		return (
			<div>
				<div
					className="editor-media-modal-image-editor__crop-background"
					style={ {
						top: this.props.bounds.topBound + 'px',
						left: left + 'px',
						width: width + 'px',
						height: Math.max( 0, top - this.props.bounds.topBound ) + 'px'
					} }/>
				<div
					className="editor-media-modal-image-editor__crop-background"
					style={ {
						top: this.props.bounds.topBound + 'px',
						left: this.props.bounds.leftBound + 'px',
						width: Math.max( 0, left - this.props.bounds.leftBound ) + 'px',
						height: Math.max( 0, this.props.bounds.bottomBound - this.props.bounds.topBound ) + 'px'
					} }/>
				<div
					className="editor-media-modal-image-editor__crop-background"
					style={ {
						top: bottom + 'px',
						left: left + 'px',
						width: width + 'px',
						height: Math.max( 0, this.props.bounds.bottomBound - bottom ) + 'px'
					} }/>
				<div
					className="editor-media-modal-image-editor__crop-background"
					style={ {
						top: this.props.bounds.topBound + 'px',
						left: right + 'px',
						width: Math.max( 0, this.props.bounds.rightBound - right ) + 'px',
						height: Math.max( 0, this.props.bounds.bottomBound - this.props.bounds.topBound ) + 'px'
					} }/>
				<Draggable
					ref="border"
					onDrag={ this.onBorderDrag }
					onStop={ this.applyCrop }
					x={ left }
					y={ top }
					width={ width }
					height={ height }
					bounds={ {
						top: this.props.bounds.topBound,
						left: this.props.bounds.leftBound,
						bottom: this.props.bounds.bottomBound,
						right: this.props.bounds.rightBound
					} }
					className="editor-media-modal-image-editor__crop" />
				<Draggable
					onDrag={ this.onTopLeftDrag }
					onStop={ this.applyCrop }
					x={ left }
					y={ top }
					controlled
					bounds={ { top: this.props.bounds.topBound - 1, left: this.props.bounds.leftBound - 1, bottom, right } }
					ref="topLeft"
					className={ classNames( handleClassName, handleClassName + '-nwse' ) }/>
				<Draggable
					onDrag={ this.onTopRightDrag }
					onStop={ this.applyCrop }
					y={ top }
					x={ right }
					controlled
					bounds={ { top: this.props.bounds.topBound - 1, right: this.props.bounds.rightBound - 1, bottom, left } }
					ref="topRight"
					className={ classNames( handleClassName, handleClassName + '-nesw' ) } />
				<Draggable
					onDrag={ this.onBottomRightDrag }
					onStop={ this.applyCrop }
					y={ bottom }
					x={ right }
					controlled
					bounds={ { bottom: this.props.bounds.bottomBound - 1, right: this.props.bounds.rightBound - 1, top, left } }
					ref="bottomRight"
					className={ classNames( handleClassName, handleClassName + '-nwse' ) } />
				<Draggable
					onDrag={ this.onBottomLeftDrag }
					onStop={ this.applyCrop }
					y={ bottom }
					x={ left }
					controlled
					bounds={ { bottom: this.props.bounds.bottomBound - 1, left: this.props.bounds.leftBound - 1, top, right } }
					ref="bottomLeft"
					className={ classNames( handleClassName, handleClassName + '-nesw' ) } />
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const bounds = getImageEditorCropBounds( state );
		const crop = getImageEditorCrop( state );
		const aspectRatio = getImageEditorAspectRatio( state );
		const { degrees } = getImageEditorTransform( state );

		return { bounds, crop, aspectRatio, degrees };
	},
	{ imageEditorCrop }
)( MediaModalImageEditorCrop );
