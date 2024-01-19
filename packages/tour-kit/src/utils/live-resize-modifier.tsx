import { debug } from '../utils';
import type { ModifierArguments, Options, State } from '@popperjs/core';
import type { Modifier } from 'react-popper';

// Adds the resizeObserver and mutationObserver properties to the popper effect function argument
type ModifierArgumentsWithObserversProp = ModifierArguments< Options > & {
	state: State & {
		elements: State[ 'elements' ] & {
			reference: State[ 'elements' ][ 'reference' ] & {
				[ key: symbol ]: {
					resizeObserver: ResizeObserver;
					mutationObserver: MutationObserver;
				};
			};
		};
	};
};

export interface LiveResizeConfiguration {
	/** CSS Selector for the the DOM node (and children) to observe for mutations */
	rootElementSelector?: string;
	/** True to enable update on reference element resize, defaults to false */
	resize?: boolean;
	/** True to enable update on node and subtree mutation, defaults to false. May be performance intensive */
	mutation?: boolean;
}

type liveResizeModifierFactory = (
	params: LiveResizeConfiguration | undefined
) => Modifier< 'liveResizeModifier', Record< string, unknown > >;

/**
 * Function that returns a Popper modifier that observes the specified root element as well as
 * reference element for any changes. The reason for being a currying function is so that
 * we can customise the root element selector, otherwise observing at a higher than necessary
 * level might cause unnecessary performance penalties.
 *
 * The Popper modifier queues an asynchronous update on the Popper instance whenever either of the
 * Observers trigger its callback.
 * @returns custom Popper modifier
 */
export const liveResizeModifier: liveResizeModifierFactory = (
	{ rootElementSelector, mutation = false, resize = false }: LiveResizeConfiguration = {
		mutation: false,
		resize: false,
	}
) => ( {
	name: 'liveResizeModifier',
	enabled: true,
	phase: 'main',
	fn: () => {
		return;
	},
	effect: ( arg0 ) => {
		try {
			const { state, instance } = arg0 as ModifierArgumentsWithObserversProp; // augment types here because we are mutating the properties on the argument that is passed in

			const ObserversProp = Symbol(); // use a symbol here so that we don't clash with multiple poppers using this modifier on the same reference node
			const { reference } = state.elements;

			reference[ ObserversProp ] = {
				resizeObserver: new ResizeObserver( () => {
					instance.update();
				} ),

				mutationObserver: new MutationObserver( () => {
					instance.update();
				} ),
			};

			if ( resize ) {
				if ( reference instanceof Element ) {
					reference[ ObserversProp ].resizeObserver.observe( reference );
				} else {
					debug(
						'Error: ResizeObserver does not work with virtual elements, Tour Kit will not resize automatically if the size of the referenced element changes.'
					);
				}
			}

			if ( mutation ) {
				const rootElementNode = document.querySelector( rootElementSelector || '#wpwrap' );
				if ( rootElementNode instanceof Element ) {
					reference[ ObserversProp ].mutationObserver.observe( rootElementNode, {
						attributes: true,
						characterData: true,
						childList: true,
						subtree: true,
					} );
				} else {
					debug(
						`Error: ${ rootElementSelector } selector did not find a valid DOM element, Tour Kit will not update automatically if the DOM layout changes.`
					);
				}
			}

			return () => {
				reference[ ObserversProp ].resizeObserver.disconnect();
				reference[ ObserversProp ].mutationObserver.disconnect();
				delete reference[ ObserversProp ];
			};
		} catch ( error ) {
			debug( 'Error: Tour Kit live resize modifier failed unexpectedly:', error );
		}
	},
} );
