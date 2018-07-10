/**
 * External dependencies
 */
import { debounce, includes } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	Component,
	Children,
	cloneElement,
	findDOMNode,
	concatChildren,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import Popover from '../popover';

/**
 * Time over children to wait before showing tooltip
 *
 * @type {Number}
 */
const TOOLTIP_DELAY = 700;

class Tooltip extends Component {
	constructor() {
		super( ...arguments );

		this.bindNode = this.bindNode.bind( this );
		this.delayedSetIsOver = debounce(
			( isOver ) => this.setState( { isOver } ),
			TOOLTIP_DELAY
		);

		this.state = {
			isOver: false,
		};
	}

	componentWillUnmount() {
		this.delayedSetIsOver.cancel();
		this.disconnectDisabledAttributeObserver();
	}

	componentDidUpdate( prevProps, prevState ) {
		const { isOver } = this.state;
		if ( isOver !== prevState.isOver ) {
			if ( isOver ) {
				this.observeDisabledAttribute();
			} else {
				this.disconnectDisabledAttributeObserver();
			}
		}
	}

	/**
	 * Assigns DOM node of the rendered component as an instance property.
	 *
	 * @param {Element} ref Rendered component reference.
	 */
	bindNode( ref ) {
		// Disable reason: Because render clones the child, we don't know what
		// type of element we have, but if it's a DOM node, we want to observe
		// the disabled attribute.
		// eslint-disable-next-line react/no-find-dom-node
		this.node = findDOMNode( ref );
	}

	/**
	 * Disconnects any DOM observer attached to the rendered node.
	 */
	disconnectDisabledAttributeObserver() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
	}

	/**
	 * Adds a DOM observer to the rendered node, if supported and if the DOM
	 * node exists, to monitor for application of a disabled attribute.
	 */
	observeDisabledAttribute() {
		if ( ! window.MutationObserver || ! this.node ) {
			return;
		}

		this.observer = new window.MutationObserver( ( [ mutation ] ) => {
			if ( mutation.target.disabled ) {
				// We can assume here that isOver is true, because mutation
				// observer is only attached for duration of isOver active
				this.setState( { isOver: false } );
			}
		} );

		// Monitor changes to the disable attribute on the DOM node
		this.observer.observe( this.node, {
			subtree: true,
			attributes: true,
			attributeFilter: [ 'disabled' ],
		} );
	}

	emitToChild( eventName, event ) {
		const { children } = this.props;
		if ( Children.count( children ) !== 1 ) {
			return;
		}

		const child = Children.only( children );
		if ( typeof child.props[ eventName ] === 'function' ) {
			child.props[ eventName ]( event );
		}
	}

	createToggleIsOver( eventName, isDelayed ) {
		return ( event ) => {
			// Preserve original child callback behavior
			this.emitToChild( eventName, event );

			// Mouse events behave unreliably in React for disabled elements,
			// firing on mouseenter but not mouseleave.  Further, the default
			// behavior for disabled elements in some browsers is to ignore
			// mouse events. Don't bother trying to to handle them.
			//
			// See: https://github.com/facebook/react/issues/4251
			if ( event.currentTarget.disabled ) {
				return;
			}

			// Needed in case unsetting is over while delayed set pending, i.e.
			// quickly blur/mouseleave before delayedSetIsOver is called
			this.delayedSetIsOver.cancel();

			const isOver = includes( [ 'focus', 'mouseenter' ], event.type );
			if ( isOver === this.state.isOver ) {
				return;
			}

			if ( isDelayed ) {
				this.delayedSetIsOver( isOver );
			} else {
				this.setState( { isOver } );
			}
		};
	}

	render() {
		const { children, position, text, shortcut } = this.props;
		if ( Children.count( children ) !== 1 ) {
			if ( 'development' === process.env.NODE_ENV ) {
				// eslint-disable-next-line no-console
				console.error( 'Tooltip should be called with only a single child element.' );
			}

			return children;
		}

		const child = Children.only( children );
		const { isOver } = this.state;
		return cloneElement( child, {
			ref: this.bindNode,
			onMouseEnter: this.createToggleIsOver( 'onMouseEnter', true ),
			onMouseLeave: this.createToggleIsOver( 'onMouseLeave' ),
			onClick: this.createToggleIsOver( 'onClick' ),
			onFocus: this.createToggleIsOver( 'onFocus' ),
			onBlur: this.createToggleIsOver( 'onBlur' ),
			children: concatChildren(
				child.props.children,
				isOver && (
					<Popover
						focusOnMount={ false }
						position={ position }
						className="components-tooltip"
						aria-hidden="true"
					>
						{ text }
						{ shortcut && <span className="components-tooltip__shortcut">{ shortcut }</span> }
					</Popover>
				),
			),
		} );
	}
}

export default Tooltip;
