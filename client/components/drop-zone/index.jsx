/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	without = require( 'lodash/array/without' ),
	includes = require( 'lodash/collection/includes' ),
	classNames = require( 'classnames' ),
	noop = require( 'lodash/utility/noop' );

/**
 * Internal dependencies
 */
var RootChild = require( 'components/root-child' );

module.exports = React.createClass( {
	displayName: 'DropZone',

	propTypes: {
		onDrop: React.PropTypes.func,
		onVerifyValidTransfer: React.PropTypes.func,
		onFilesDrop: React.PropTypes.func,
		fullScreen: React.PropTypes.bool,
		icon: React.PropTypes.string
	},

	getInitialState: function() {
		return {
			isDraggingOverDocument: false,
			isDraggingOverElement: false
		};
	},

	getDefaultProps: function() {
		return {
			onDrop: noop,
			onVerifyValidTransfer: () => true,
			onFilesDrop: noop,
			fullScreen: false,
			icon: 'dashicons dashicons-admin-media'
		};
	},

	componentDidMount: function() {
		this.dragEnterNodes = [];

		window.addEventListener( 'dragover', this.preventDefault );
		window.addEventListener( 'drop', this.onDrop );
		window.addEventListener( 'dragenter', this.toggleDraggingOverDocument );
		window.addEventListener( 'dragleave', this.toggleDraggingOverDocument );
		window.addEventListener( 'mouseup', this.resetDragState );
	},

	componentDidUpdate: function( prevProps, prevState ) {
		if ( prevState.isDraggingOverDocument !== this.state.isDraggingOverDocument ) {
			this.toggleMutationObserver();
		}
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'dragover', this.preventDefault );
		window.removeEventListener( 'drop', this.onDrop );
		window.removeEventListener( 'dragenter', this.toggleDraggingOverDocument );
		window.removeEventListener( 'dragleave', this.toggleDraggingOverDocument );
		window.removeEventListener( 'mouseup', this.resetDragState );
		this.disconnectMutationObserver();
	},

	resetDragState: function() {
		if ( ! ( this.state.isDraggingOverDocument || this.state.isDraggingOverElement ) ) {
			return;
		}

		this.setState( this.getInitialState() );
	},

	toggleMutationObserver: function() {
		this.disconnectMutationObserver();

		if ( this.state.isDraggingOverDocument ) {
			this.observer = new window.MutationObserver( this.detectNodeRemoval );
			this.observer.observe( document.body, {
				childList: true,
				subtree: true
			} );
		}
	},

	disconnectMutationObserver: function() {
		if ( ! this.observer ) {
			return;
		}

		this.observer.disconnect();
		delete this.observer;
	},

	detectNodeRemoval: function( mutations ) {
		mutations.forEach( ( mutation ) => {
			if ( ! mutation.removedNodes.length ) {
				return;
			}

			this.dragEnterNodes = without( this.dragEnterNodes, Array.from( mutation.removedNodes ) );
		} );
	},

	toggleDraggingOverDocument: function( event ) {
		var isDraggingOverDocument, detail, isValidDrag;

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
	},

	preventDefault: function( event ) {
		event.preventDefault();
	},

	isWithinZoneBounds: function( x, y ) {
		var rect;

		if ( ! this.refs.zone ) {
			return false;
		}

		rect = this.refs.zone.getDOMNode().getBoundingClientRect();

		return x >= rect.left && x <= rect.right &&
			y >= rect.top && y <= rect.bottom;
	},

	onDrop: function( event ) {
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
	},

	renderContent: function() {
		var content;

		if ( this.props.children ) {
			content = this.props.children;
		} else {
			content = React.addons.createFragment( {
				icon: <span className={ classNames( 'drop-zone__content-icon', this.props.icon ) } />,
				text: (
					<span className="drop-zone__content-text">
						{ this.translate( 'Drop files to upload' ) }
					</span>
				)
			} );
		}

		return <div className="drop-zone__content">{ content }</div>;
	},

	render: function() {
		var classes = classNames( 'drop-zone', {
			'is-active': this.state.isDraggingOverDocument || this.state.isDraggingOverElement,
			'is-dragging-over-document': this.state.isDraggingOverDocument,
			'is-dragging-over-element': this.state.isDraggingOverElement,
			'is-full-screen': this.props.fullScreen
		} ), element;

		element = (
			<div ref="zone" className={ classes }>
				{ this.renderContent() }
			</div>
		);

		if ( this.props.fullScreen ) {
			return <RootChild>{ element }</RootChild>;
		} else {
			return element;
		}
	}
} );
