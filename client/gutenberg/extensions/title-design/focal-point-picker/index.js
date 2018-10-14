/**
 * Wordpress dependencies
 */

import {
	Component,
	createRef
} from '@wordpress/element';

/**
 * External dependencies
 */

import classnames from 'classnames';

/**
 * Internal dependencies
 */

 import './style.scss';

 export class FocalPointPicker extends Component {

	constructor() {
		super( ...arguments );
		this.onMouseMove = this.onMouseMove.bind( this );
		this.containerRef = createRef();
		this.getComponentDimensions = this.getComponentDimensions.bind( this );
		this.onContainerResize = this.onContainerResize.bind( this );
		this.state = {
			isDragging: false,
			left: null,
			top: null,
			loaded: false,
			bounds: {
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				width: 0,
				height: 0
			}
		}
		this.refreshInterval = null;
		this.setState( { bounds: this.calculateBounds() } );
	}

	componentDidMount() {

		this.containerRef.current.addEventListener( 'resize', this.onContainerResize );
		this.calculateBounds();

	}

	onContainerResize() {

		this.calculateBounds();

	}

	componentDidUpdate( prevProps ) {

		if ( prevProps.dimensions !== this.props.dimensions ) {
			this.calculateBounds();
		}

	}

	calculateBounds() {

		const { dimensions } = this.props;

		const {
			width,
			height
		} = this.getComponentDimensions();

		const bounds = {
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			width: 0,
			height: 0
		};

		const widthRatio = width / dimensions.width;
		const heightRatio = height / dimensions.height;

		if ( heightRatio >= widthRatio ) {

			bounds.width = bounds.right = width;
			bounds.height = dimensions.height * widthRatio;
			bounds.top = ( height - bounds.height ) / 2;
			bounds.bottom = bounds.top + bounds.height;

		} else {

			bounds.height = bounds.bottom = height;
			bounds.width = dimensions.width * heightRatio;
			bounds.left = ( width - bounds.width ) / 2;
			bounds.right = bounds.left + bounds.width;

		}

		this.setState( { bounds } );

		return bounds;
	}

	onMouseMove( e ) {

		const { isDragging, bounds } = this.state;
		const { setFocalPoint } = this.props;

		if ( isDragging ) {

			const {
				width,
				height,
				offset
			} = this.getComponentDimensions();

			const pos = {
				left: e.pageX - offset.left,
				top: e.pageY - offset.top
			}

			const left = Math.max(
				bounds.left, Math.min(
					pos.left, bounds.right
				)
			);

			const top = Math.max(
				bounds.top, Math.min(
					pos.top, bounds.bottom
				)
			);

			setFocalPoint( {
				x: left / width,
				y: top / height
			} );

		}

	}

	getComponentDimensions() {

		const $ = window.jQuery;
		return {
			width: $( this.containerRef.current ).width(),
			height: $( this.containerRef.current ).height(),
			offset: $( this.containerRef.current ).offset()
		};

	}

	render() {

		const {
			url,
			focalPoint
		} = this.props;

		const { isDragging } = this.state;

		const {
			width,
			height
		} = this.getComponentDimensions();

		const containerStyle = { backgroundImage: `url(${ url })` };

		const dotStyle = {
			left: `${ focalPoint.x * width }px`,
			top: `${ focalPoint.y * height }px`
		};

		const targetClasses = classnames(
			'component-focal-point-picker__target',
			isDragging ? 'is-dragging' : null
		);

		return (
			<div
				className="component-focal-point-picker"
				style={ containerStyle }
				onMouseDown={ () => this.setState( { isDragging: true } ) }
				onDragStart={ () => this.setState( { isDragging: true } ) }
				onMouseUp={ () => this.setState( { isDragging: false } ) }
				onDrop={ () => this.setState( { isDragging: false } ) }
				onMouseMove={ this.onMouseMove }
				ref={ this.containerRef }
				role='button'
				tabIndex='0'
			>
				<div
					className={ targetClasses }
					style={ dotStyle }
				>
					<i class="component-focal-point-picker__icon allow-touchmove"></i>
				</div>
			</div>
		);
	}
}

FocalPointPicker.defaultProps = {
	url: null,
	dimensions: {
		height: 0,
		width: 0
	},
	focalPoint: {
		x: 0.5,
		y: 0.5
	},
	setFocalPoint: () => {}
}

export default FocalPointPicker;
