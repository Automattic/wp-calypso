// Component types the `show-component` ability can render. Single source for
// the input schema enum, the `ShowComponentType` union, and the component map.
export const SHOW_COMPONENT_TYPES = [ 'button-picker', 'font-picker', 'color-picker' ] as const;

export type ShowComponentType = ( typeof SHOW_COMPONENT_TYPES )[ number ];
