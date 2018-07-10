/**
 * External dependencies
 */
import { forEach } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	Component,
	forwardRef,
	createHigherOrderComponent,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Listener from './listener';

/**
 * Listener instance responsible for managing document event handling.
 *
 * @type {Listener}
 */
const listener = new Listener();

function withGlobalEvents( eventTypesToHandlers ) {
	return createHigherOrderComponent( ( WrappedComponent ) => {
		class Wrapper extends Component {
			constructor() {
				super( ...arguments );

				this.handleEvent = this.handleEvent.bind( this );
				this.handleRef = this.handleRef.bind( this );
			}

			componentDidMount() {
				forEach( eventTypesToHandlers, ( handler, eventType ) => {
					listener.add( eventType, this );
				} );
			}

			componentWillUnmount() {
				forEach( eventTypesToHandlers, ( handler, eventType ) => {
					listener.remove( eventType, this );
				} );
			}

			handleEvent( event ) {
				const handler = eventTypesToHandlers[ event.type ];
				if ( typeof this.wrappedRef[ handler ] === 'function' ) {
					this.wrappedRef[ handler ]( event );
				}
			}

			handleRef( el ) {
				this.wrappedRef = el;
				// Any component using `withGlobalEvents` that is not setting a `ref`
				// will cause `this.props.forwardedRef` to be `null`, so we need this
				// check.
				if ( this.props.forwardedRef ) {
					this.props.forwardedRef( el );
				}
			}

			render() {
				return <WrappedComponent { ...this.props } ref={ this.handleRef } />;
			}
		}

		return forwardRef( ( props, ref ) => {
			return <Wrapper { ...props } forwardedRef={ ref } />;
		} );
	}, 'withGlobalEvents' );
}

export default withGlobalEvents;
