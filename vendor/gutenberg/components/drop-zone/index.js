/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import Dashicon from '../dashicon';

class DropZone extends Component {
	constructor() {
		super( ...arguments );

		this.setZoneNode = this.setZoneNode.bind( this );

		this.state = {
			isDraggingOverDocument: false,
			isDraggingOverElement: false,
			position: null,
			type: null,
		};
	}

	componentDidMount() {
		this.context.dropzones.add( {
			element: this.zone,
			updateState: this.setState.bind( this ),
			onDrop: this.props.onDrop,
			onFilesDrop: this.props.onFilesDrop,
			onHTMLDrop: this.props.onHTMLDrop,
		} );
	}

	componentWillUnmount() {
		this.context.dropzones.remove( this.zone );
	}

	setZoneNode( node ) {
		this.zone = node;
	}

	render() {
		const { className, label } = this.props;
		const { isDraggingOverDocument, isDraggingOverElement, position, type } = this.state;
		const classes = classnames( 'components-drop-zone', className, {
			'is-active': isDraggingOverDocument || isDraggingOverElement,
			'is-dragging-over-document': isDraggingOverDocument,
			'is-dragging-over-element': isDraggingOverElement,
			'is-close-to-top': position && position.y === 'top',
			'is-close-to-bottom': position && position.y === 'bottom',
			'is-close-to-left': position && position.x === 'left',
			'is-close-to-right': position && position.x === 'right',
			[ `is-dragging-${ type }` ]: !! type,
		} );

		return (
			<div ref={ this.setZoneNode } className={ classes }>
				<div className="components-drop-zone__content">
					{ [
						<Dashicon
							key="icon"
							icon="upload"
							size="40"
							className="components-drop-zone__content-icon"
						/>,
						<span
							key="text"
							className="components-drop-zone__content-text"
						>
							{ label ? label : __( 'Drop files to upload' ) }
						</span>,
					] }
				</div>
			</div>
		);
	}
}

DropZone.contextTypes = {
	dropzones: noop,
};

export default DropZone;

