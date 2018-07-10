/**
 * External dependencies
 */
import { isEqual, find, some, filter, noop, throttle } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, findDOMNode } from '@wordpress/element';
import isShallowEqual from '@wordpress/is-shallow-equal';

class DropZoneProvider extends Component {
	constructor() {
		super( ...arguments );

		this.resetDragState = this.resetDragState.bind( this );
		this.toggleDraggingOverDocument = throttle( this.toggleDraggingOverDocument.bind( this ), 200 );
		this.dragOverListener = this.dragOverListener.bind( this );
		this.isWithinZoneBounds = this.isWithinZoneBounds.bind( this );
		this.onDrop = this.onDrop.bind( this );

		this.state = {
			isDraggingOverDocument: false,
			hoveredDropZone: -1,
			position: null,
		};
		this.dropzones = [];
	}

	dragOverListener( event ) {
		this.toggleDraggingOverDocument( event, this.getDragEventType( event ) );
		event.preventDefault();
	}

	getChildContext() {
		return {
			dropzones: {
				add: ( { element, updateState, onDrop, onFilesDrop, onHTMLDrop } ) => {
					this.dropzones.push( { element, updateState, onDrop, onFilesDrop, onHTMLDrop } );
				},
				remove: ( element ) => {
					this.dropzones = filter( this.dropzones, ( dropzone ) => dropzone.element !== element );
				},
			},
		};
	}

	componentDidMount() {
		window.addEventListener( 'dragover', this.dragOverListener );
		window.addEventListener( 'drop', this.onDrop );
		window.addEventListener( 'mouseup', this.resetDragState );

		// Disable reason: Can't use a ref since this component just renders its children
		// eslint-disable-next-line react/no-find-dom-node
		this.container = findDOMNode( this );
	}

	componentWillUnmount() {
		window.removeEventListener( 'dragover', this.dragOverListener );
		window.removeEventListener( 'drop', this.onDrop );
		window.removeEventListener( 'mouseup', this.resetDragState );
	}

	resetDragState() {
		// Avoid throttled drag over handler calls
		this.toggleDraggingOverDocument.cancel();

		const { isDraggingOverDocument, hoveredDropZone } = this.state;
		if ( ! isDraggingOverDocument && hoveredDropZone === -1 ) {
			return;
		}

		this.setState( {
			isDraggingOverDocument: false,
			hoveredDropZone: -1,
			position: null,
		} );

		this.dropzones.forEach( ( { updateState } ) => {
			updateState( {
				isDraggingOverDocument: false,
				isDraggingOverElement: false,
				position: null,
				type: null,
			} );
		} );
	}

	getDragEventType( event ) {
		if ( event.dataTransfer ) {
			if ( event.dataTransfer.types.indexOf( 'Files' ) !== -1 ) {
				return 'file';
			}

			if ( event.dataTransfer.types.indexOf( 'text/html' ) !== -1 ) {
				return 'html';
			}
		}

		return 'default';
	}

	doesDropzoneSupportType( dropzone, type ) {
		return (
			( type === 'file' && dropzone.onFilesDrop ) ||
			( type === 'html' && dropzone.onHTMLDrop ) ||
			( type === 'default' && dropzone.onDrop )
		);
	}

	toggleDraggingOverDocument( event, dragEventType ) {
		// In some contexts, it may be necessary to capture and redirect the
		// drag event (e.g. atop an `iframe`). To accommodate this, you can
		// create an instance of CustomEvent with the original event specified
		// as the `detail` property.
		//
		// See: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
		const detail = window.CustomEvent && event instanceof window.CustomEvent ? event.detail : event;

		// Index of hovered dropzone.

		const hoveredDropZones = filter( this.dropzones, ( dropzone ) =>
			this.doesDropzoneSupportType( dropzone, dragEventType ) &&
			this.isWithinZoneBounds( dropzone.element, detail.clientX, detail.clientY )
		);

		// Find the leaf dropzone not containing another dropzone
		const hoveredDropZone = find( hoveredDropZones, ( zone ) => (
			! some( hoveredDropZones, ( subZone ) => subZone !== zone && zone.element.parentElement.contains( subZone.element ) )
		) );

		const hoveredDropZoneIndex = this.dropzones.indexOf( hoveredDropZone );

		let position = null;

		if ( hoveredDropZone ) {
			const rect = hoveredDropZone.element.getBoundingClientRect();

			position = {
				x: detail.clientX - rect.left < rect.right - detail.clientX ? 'left' : 'right',
				y: detail.clientY - rect.top < rect.bottom - detail.clientY ? 'top' : 'bottom',
			};
		}

		// Optimisation: Only update the changed dropzones
		let dropzonesToUpdate = [];

		if ( ! this.state.isDraggingOverDocument ) {
			dropzonesToUpdate = this.dropzones;
		} else if ( hoveredDropZoneIndex !== this.state.hoveredDropZone ) {
			if ( this.state.hoveredDropZone !== -1 ) {
				dropzonesToUpdate.push( this.dropzones[ this.state.hoveredDropZone ] );
			}
			if ( hoveredDropZone ) {
				dropzonesToUpdate.push( hoveredDropZone );
			}
		} else if (
			hoveredDropZone &&
			hoveredDropZoneIndex === this.state.hoveredDropZone &&
			! isEqual( position, this.state.position )
		) {
			dropzonesToUpdate.push( hoveredDropZone );
		}

		// Notifying the dropzones
		dropzonesToUpdate.map( ( dropzone ) => {
			const index = this.dropzones.indexOf( dropzone );
			const isDraggingOverDropZone = index === hoveredDropZoneIndex;
			dropzone.updateState( {
				isDraggingOverElement: isDraggingOverDropZone,
				position: isDraggingOverDropZone ? position : null,
				isDraggingOverDocument: this.doesDropzoneSupportType( dropzone, dragEventType ),
				type: isDraggingOverDropZone ? dragEventType : null,
			} );
		} );

		const newState = {
			isDraggingOverDocument: true,
			hoveredDropZone: hoveredDropZoneIndex,
			position,
		};
		if ( ! isShallowEqual( newState, this.state ) ) {
			this.setState( newState );
		}
	}

	isWithinZoneBounds( dropzone, x, y ) {
		const isWithinElement = ( element ) => {
			const rect = element.getBoundingClientRect();
			/// make sure the rect is a valid rect
			if ( rect.bottom === rect.top || rect.left === rect.right ) {
				return false;
			}

			return (
				x >= rect.left && x <= rect.right &&
				y >= rect.top && y <= rect.bottom
			);
		};

		return isWithinElement( dropzone );
	}

	onDrop( event ) {
		// This seemingly useless line has been shown to resolve a Safari issue
		// where files dragged directly from the dock are not recognized
		event.dataTransfer && event.dataTransfer.files.length; // eslint-disable-line no-unused-expressions

		const { position, hoveredDropZone } = this.state;
		const dragEventType = this.getDragEventType( event );
		const dropzone = this.dropzones[ hoveredDropZone ];
		const isValidDropzone = !! dropzone && this.container.contains( event.target );
		this.resetDragState();

		if ( isValidDropzone ) {
			switch ( dragEventType ) {
				case 'file':
					dropzone.onFilesDrop( [ ...event.dataTransfer.files ], position );
					break;
				case 'html':
					dropzone.onHTMLDrop( event.dataTransfer.getData( 'text/html' ), position );
					break;
				case 'default':
					dropzone.onDrop( event, position );
			}
		}

		event.stopPropagation();
		event.preventDefault();
	}

	render() {
		const { children } = this.props;
		return children;
	}
}

DropZoneProvider.childContextTypes = {
	dropzones: noop,
};

export default DropZoneProvider;
