/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { identity, includes, noop, without } from 'lodash';

/**
 * Internal dependencies
 */
import { RootChild } from '@automattic/components';
import Gridicon from 'components/gridicon';
import { hideDropZone, showDropZone } from 'state/ui/drop-zone/actions';
import TranslatableString from 'components/translatable/proptype';

/**
 * Style dependencies
 */
import './style.scss';

export class DropZone extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		fullScreen: PropTypes.bool,
		icon: PropTypes.node,
		onDrop: PropTypes.func,
		onVerifyValidTransfer: PropTypes.func,
		onFilesDrop: PropTypes.func,
		textLabel: TranslatableString,
		translate: PropTypes.func,
		showDropZone: PropTypes.func.isRequired,
		hideDropZone: PropTypes.func.isRequired,
		dropZoneName: PropTypes.string,
	};

	static defaultProps = {
		className: null,
		onDrop: noop,
		onVerifyValidTransfer: () => true,
		onFilesDrop: noop,
		fullScreen: false,
		icon: <Gridicon icon="cloud-upload" size={ 48 } />,
		translate: identity,
		dropZoneName: null,
	};

	state = {
		isDraggingOverDocument: false,
		isDraggingOverElement: false,
		lastVisibleState: false,
	};

	zoneRef = React.createRef();

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

	resetDragState = () => {
		if ( ! ( this.state.isDraggingOverDocument || this.state.isDraggingOverElement ) ) {
			return;
		}

		this.setState( {
			isDraggingOverDocument: false,
			isDraggingOverElement: false,
		} );

		this.toggleDropZoneReduxState( false );
	};

	toggleMutationObserver = () => {
		this.disconnectMutationObserver();

		if ( this.state.isDraggingOverDocument ) {
			this.observer = new window.MutationObserver( this.detectNodeRemoval );
			this.observer.observe( document.body, {
				childList: true,
				subtree: true,
			} );
		}
	};

	disconnectMutationObserver = () => {
		if ( ! this.observer ) {
			return;
		}

		this.observer.disconnect();
		delete this.observer;
	};

	detectNodeRemoval = ( mutations ) => {
		mutations.forEach( ( mutation ) => {
			if ( ! mutation.removedNodes.length ) {
				return;
			}

			this.dragEnterNodes = without( this.dragEnterNodes, Array.from( mutation.removedNodes ) );
		} );
	};

	toggleDraggingOverDocument = ( event ) => {
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
		const detail = window.CustomEvent && event instanceof window.CustomEvent ? event.detail : event,
			isValidDrag = this.props.onVerifyValidTransfer( detail.dataTransfer ),
			isDraggingOverDocument = isValidDrag && this.dragEnterNodes.length;

		this.setState( {
			isDraggingOverDocument: isDraggingOverDocument,
			isDraggingOverElement:
				isDraggingOverDocument &&
				( this.props.fullScreen || this.isWithinZoneBounds( detail.clientX, detail.clientY ) ),
		} );

		if ( window.CustomEvent && event instanceof window.CustomEvent ) {
			// For redirected CustomEvent instances, immediately remove window
			// from tracked nodes since another "real" event will be triggered.
			this.dragEnterNodes = without( this.dragEnterNodes, window );
		}

		this.toggleDropZoneReduxState(
			!! ( this.state.isDraggingOverDocument || this.state.isDraggingOverElement )
		);
	};

	toggleDropZoneReduxState = ( isVisible ) => {
		if ( this.state.lastVisibleState !== isVisible ) {
			if ( isVisible ) {
				this.props.showDropZone( this.props.dropZoneName );
			} else {
				this.props.hideDropZone( this.props.dropZoneName );
			}

			this.setState( {
				lastVisibleState: isVisible,
			} );
		}
	};

	preventDefault = ( event ) => {
		event.preventDefault();
	};

	isWithinZoneBounds = ( x, y ) => {
		if ( ! this.zoneRef.current ) {
			return false;
		}

		const rect = this.zoneRef.current.getBoundingClientRect();

		/// make sure the rect is a valid rect
		if ( rect.bottom === rect.top || rect.left === rect.right ) {
			return false;
		}

		return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
	};

	onDrop = ( event ) => {
		// This seemingly useless line has been shown to resolve a Safari issue
		// where files dragged directly from the dock are not recognized
		event.dataTransfer && event.dataTransfer.files.length;

		this.resetDragState();

		// Regardless of whether or not files are dropped in the zone,
		// prevent the browser default action, which navigates to the file.
		event.preventDefault();

		if (
			! this.props.fullScreen &&
			! ReactDom.findDOMNode( this.zoneRef.current ).contains( event.target )
		) {
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
	};

	renderContent = () => {
		const textLabel = this.props.textLabel
			? this.props.textLabel
			: this.props.translate( 'Drop files to upload' );

		return (
			<div className="drop-zone__content">
				{ this.props.children ? (
					this.props.children
				) : (
					<div>
						<span className="drop-zone__content-icon">{ this.props.icon }</span>
						<span className="drop-zone__content-text">{ textLabel }</span>
					</div>
				) }
			</div>
		);
	};

	render() {
		const classes = classNames( 'drop-zone', this.props.className, {
			'is-active': this.state.isDraggingOverDocument || this.state.isDraggingOverElement,
			'is-dragging-over-document': this.state.isDraggingOverDocument,
			'is-dragging-over-element': this.state.isDraggingOverElement,
			'is-full-screen': this.props.fullScreen,
		} );

		const element = (
			<div ref={ this.zoneRef } className={ classes }>
				{ this.renderContent() }
			</div>
		);

		if ( this.props.fullScreen ) {
			return <RootChild>{ element }</RootChild>;
		}
		return element;
	}
}

const mapDispatch = {
	showDropZone,
	hideDropZone,
};

export default connect( null, mapDispatch )( localize( DropZone ) );
