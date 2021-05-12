/**
 * Internal dependencies
 */
import type { ARIA_STATES, ARIA_PROPERTIES } from './constants';

export type RawAriaState = typeof ARIA_STATES[ number ];
export type RawAriaStates = Record< RawAriaState, boolean >;
export type AriaState = `aria-${ RawAriaState }`;
export type AriaStates = Record< AriaState, boolean >;

export type RawAriaProperty = typeof ARIA_PROPERTIES[ number ];
export type RawAriaProperties = Record< RawAriaProperty, string >;
export type AriaProperty = `aria-${ RawAriaProperty }`;
export type AriaProperties = Record< AriaProperty, string >;

export type AriaProps = Partial< RawAriaState & RawAriaProperties >;
export type AriaAttributes = Partial< AriaStates & AriaProperties >;
