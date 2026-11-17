/**
 * Stub for block-editor components that only render in UI Verbum doesn't have: the full inserter
 * menu (Verbum only opens the quick inserter), list view, block bindings controls and style state
 * badges (the block sidebar), and components' deprecated private Menu, which nothing bundled reads.
 */
const NullComponent = () => null;

export default NullComponent;
export const PrivateInserterMenu = NullComponent;
export const PrivateListView = NullComponent;
export const Menu = NullComponent;
