/**
 * External dependencies
 */
import { includes, debounce } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { createContext, Component } from '@wordpress/element';
import { focus } from '@wordpress/dom';

/**
 * Internal dependencies
 */
import './style.scss';

const { Consumer, Provider } = createContext( false );

/**
 * Names of control nodes which qualify for disabled behavior.
 *
 * See WHATWG HTML Standard: 4.10.18.5: "Enabling and disabling form controls: the disabled attribute".
 *
 * @link https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute
 *
 * @type {string[]}
 */
const DISABLED_ELIGIBLE_NODE_NAMES = [
	'BUTTON',
	'FIELDSET',
	'INPUT',
	'OPTGROUP',
	'OPTION',
	'SELECT',
	'TEXTAREA',
];

class Disabled extends Component {
	constructor() {
		super( ...arguments );

		this.bindNode = this.bindNode.bind( this );
		this.disable = this.disable.bind( this );

		// Debounce re-disable since disabling process itself will incur
		// additional mutations which should be ignored.
		this.debouncedDisable = debounce( this.disable, { leading: true } );
	}

	componentDidMount() {
		this.disable();

		this.observer = new window.MutationObserver( this.debouncedDisable );
		this.observer.observe( this.node, {
			childList: true,
			attributes: true,
			subtree: true,
		} );
	}

	componentWillUnmount() {
		this.observer.disconnect();
		this.debouncedDisable.cancel();
	}

	bindNode( node ) {
		this.node = node;
	}

	disable() {
		focus.focusable.find( this.node ).forEach( ( focusable ) => {
			if ( includes( DISABLED_ELIGIBLE_NODE_NAMES, focusable.nodeName ) ) {
				focusable.setAttribute( 'disabled', '' );
			}

			if ( focusable.hasAttribute( 'tabindex' ) ) {
				focusable.removeAttribute( 'tabindex' );
			}

			if ( focusable.hasAttribute( 'contenteditable' ) ) {
				focusable.setAttribute( 'contenteditable', 'false' );
			}
		} );
	}

	render() {
		const { className, ...props } = this.props;
		return (
			<Provider value={ true }>
				<div
					ref={ this.bindNode }
					className={ classnames( className, 'components-disabled' ) }
					{ ...props }
				>
					{ this.props.children }
				</div>
			</Provider>
		);
	}
}

Disabled.Consumer = Consumer;

export default Disabled;
