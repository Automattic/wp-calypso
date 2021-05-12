/**
 * Internal dependencies
 */
import { ARIA_STATES, ARIA_PROPERTIES } from './constants';

/**
 * Types
 */
import type {
	AriaProps,
	AriaAttributes,
	AriaState,
	AriaProperty,
	RawAriaState,
	RawAriaProperty,
} from './types';

export default function useAriaProps( props: AriaProps ): AriaAttributes {
	const attrs = {} as AriaAttributes;

	for ( const key in props ) {
		if ( ARIA_STATES.includes( key as RawAriaState ) ) {
			attrs[ `aria-${ key }` as AriaState ] = !! props[ key ];
		} else if ( ARIA_PROPERTIES.includes( key as RawAriaProperty ) ) {
			attrs[ `aria-${ key }` as AriaProperty ] = props[ key ];
		}
	}

	return attrs;
}
