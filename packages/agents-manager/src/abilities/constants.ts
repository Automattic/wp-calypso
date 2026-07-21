// Ability category shared with Big Sky — matches the backend route configuration.
export const BIG_SKY_ABILITY_CATEGORY = 'big-sky';

// Component types the `show-component` ability can render. Single source for
// the input schema enum, the `ShowComponentType` union, and the component map.
export const SHOW_COMPONENT_TYPES = [ 'button-picker', 'font-picker', 'color-picker' ] as const;
