/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { Component, PropTypes } from 'react';
import createFragment from 'react-addons-create-fragment';
import without from 'lodash/without';
import includes from 'lodash/includes';
import classNames from 'classnames';
import noop from 'lodash/noop';
import identity from 'lodash/identity';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';

export class DropZone extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			isDraggingOverDocument: false,
			isDraggingOverElement: false
		};

		// Bind listeners found in componentDidMount(), except for the ones whose
		// implementation doesn't refer to `this`.
		this.onDrop = this.onDrop.bind( this );
		this.toggleDraggingOverDocument = this.toggleDraggingOverDocument.bind( this );
		this.resetDragState = this.resetDragState.bind( this );
	}

	componentDidMount() {
		this.dragEnterNodes = [];

		window.addEventListener( 'dragover', this.preventDefault );
		window.addEventListener( 'drop', this.onDrop );
		window.addEventListener( 'dragenter', this.toggleDraggingOverDocument );
		window.addEventListener( 'dragleave', this.toggleDraggingOverDocument );
		window.addEventListener( 'mouseup', this.resetDragState );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( prevState.isDraggingOverDocument !== this.state.isDraggingOverDocument ) {
			this.toggleMutationObserver();
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'dragover', this.preventDefault );
		window.removeEventListener( 'drop', this.onDrop );
		window.removeEventListener( 'dragenter', this.toggleDraggingOverDocument );
		window.removeEventListener( 'dragleave', this.toggleDraggingOverDocument );
		window.removeEventListener( 'mouseup', this.resetDragState );
		this.disconnectMutationObserver();
	}

	resetDragState() {
		if ( ! ( this.state.isDraggingOverDocument || this.state.isDraggingOverElement ) ) {
			return;
		}

		this.setState( this.getInitialState() );
	}

	toggleMutationObserver() {
		this.disconnectMutationObserver();

		if ( this.state.isDraggingOverDocument ) {
			this.observer = new window.MutationObserver( this.detectNodeRemoval );
			this.observer.observe( document.body, {
				childList: true,
				subtree: true
			} );
		}
	}

	disconnectMutationObserver() {
		if ( ! this.observer ) {
			return;
		}

		this.observer.disconnect();
		delete this.observer;
	}

	detectNodeRemoval( mutations ) {
		mutations.forEach( ( mutation ) => {
			if ( ! mutation.removedNodes.length ) {
				return;
			}

			this.dragEnterNodes = without( this.dragEnterNodes, Array.from( mutation.removedNodes ) );
		} );
	}

	toggleDraggingOverDocument( event ) {
		let isDraggingOverDocument, detail, isValidDrag;

		// Track nodes that have received a drag event. So long as nodes exist
		// in the set, we can assume that an item is being dragged on the page.
		if ( 'dragenter' === event.type && ! includes( this.dragEnterNodes, event.target ) ) {
			this.dragEnterNodes.push( event.target );
		} else if ( 'dragleave' === event.type ) {
			this.dragEnterNodes = without( this.dragEnterNodes, event.target );
		}

		// In some contexts, it may be necessary to capture and redirect the
		// drag event (e.g. atop an `iframe`). To accommodate this, you can
		// create an instance of CustomEvent with the original event specified
		// as the `detail` property.
		//
		// See: https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
		detail = window.CustomEvent && event instanceof window.CustomEvent ? event.detail : event;

		isValidDrag = this.props.onVerifyValidTransfer( detail.dataTransfer );
		isDraggingOverDocument = isValidDrag && this.dragEnterNodes.length;

		this.setState( {
			isDraggingOverDocument: isDraggingOverDocument,
			isDraggingOverElement: isDraggingOverDocument && ( this.props.fullScreen ||
				this.isWithinZoneBounds( detail.clientX, detail.clientY ) )
		} );

		if ( window.CustomEvent && event instanceof window.CustomEvent ) {
			// For redirected CustomEvent instances, immediately remove window
			// from tracked nodes since another "real" event will be triggered.
			this.dragEnterNodes = without( this.dragEnterNodes, window );
		}
	}

	preventDefault( event ) {
		event.preventDefault();
	}

	isWithinZoneBounds( x, y ) {
		let rect;

		if ( ! this.refs.zone ) {
			return false;
		}

		rect = this.refs.zone.getBoundingClientRect();

		/// make sure the rect is a valid rect
		if ( rect.bottom === rect.top || rect.left === rect.right ) {
			return false;
		}

		return x >= rect.left && x <= rect.right &&
			y >= rect.top && y <= rect.bottom;
	}

	onDrop( event ) {
		// This seemingly useless line has been shown to resolve a Safari issue
		// where files dragged directly from the dock are not recognized
		event.dataTransfer && event.dataTransfer.files.length;

		this.setState( {
			isDraggingOverDocument: false,
			isDraggingOverElement: false
		} );

		if ( ! this.props.fullScreen && ! ReactDom.findDOMNode( this.refs.zone ).contains( event.target ) ) {
			return;
		}

		this.props.onDrop( event );

		if ( ! this.props.onVerifyValidTransfer( event.dataTransfer ) ) {
			return;
		}

		if ( event.dataTransfer ) {
			this.props.onFilesDrop( Array.prototype.slice.call( event.dataTransfer.files ) );
		}

		event.stopPropagation();
		event.preventDefault();
	}

	renderContent() {
		let content;

		if ( this.props.children ) {
			content = this.props.children;
		} else {
			content = createFragment( {
				icon: <Gridicon icon={ this.props.icon } size={ 48 } className="drop-zone__content-icon" />,
				text: (
					<span className="drop-zone__content-text">
						{ this.props.translate( 'Drop files to upload' ) }
					</span>
				)
			} );
		}

		return <div className="drop-zone__content">{ content }</div>;
	}

	render() {
		const classes = classNames( 'drop-zone', {
			'is-active': this.state.isDraggingOverDocument || this.state.isDraggingOverElement,
			'is-dragging-over-document': this.state.isDraggingOverDocument,
			'is-dragging-over-element': this.state.isDraggingOverElement,
			'is-full-screen': this.props.fullScreen
		} );

		const element = (
			<div ref="zone" className={ classes }>
				{ this.renderContent() }
			</div>
		);

		if ( this.props.fullScreen ) {
			return <RootChild>{ element }</RootChild>;
		}
		return element;
	}
}

DropZone.propTypes = {
	onDrop: PropTypes.func,
	onVerifyValidTransfer: PropTypes.func,
	onFilesDrop: PropTypes.func,
	fullScreen: PropTypes.bool,
	icon: PropTypes.string,
	translate: PropTypes.func,
};

DropZone.defaultProps = {
	onDrop: noop,
	onVerifyValidTransfer: () => true,
	onFilesDrop: noop,
	fullScreen: false,
	icon: 'cloud-upload',
	translate: identity,
};

export default localize( DropZone );
