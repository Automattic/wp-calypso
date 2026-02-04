/**
 * Consolidated stubs for unused heavy modules.
 *
 * This is a JS file (not TS) because it's used as a replacement for
 * node_modules files that aren't run through the TypeScript loader.
 *
 * These stubs replace large transitive dependencies that aren't needed
 * in the verbum block editor comment context, reducing bundle size by ~50%.
 */

// Generic null component - works for most React component stubs
export const NullComponent = () => null;

// Common exports that various modules expect
export const noop = () => {};

// @wordpress/sync exports
export const createSyncProvider = noop;
export const connectIndexDb = noop;
export const getSyncProvider = noop;
export const createWebRTCConnection = noop;

// @wordpress/commands exports
export const store = { name: 'core/commands' };
export const useCommand = noop;
export const useCommandLoader = noop;
export const CommandMenu = NullComponent;
export const privateApis = {};

// @wordpress/components/calendar exports
export const DateCalendar = NullComponent;
export const DateRangeCalendar = NullComponent;
export class TZDate extends Date {}

// @wordpress/components/date-time exports
export const DateTimePicker = NullComponent;
export const DatePicker = NullComponent;
export const TimePicker = NullComponent;

// @wordpress/components/color-picker exports
export const ColorPicker = NullComponent;
export const Picker = NullComponent;

// @wordpress/components/navigation exports
export const NavigableMenu = NullComponent;
export const NavigableToolbar = NullComponent;
export const NavigationBackButton = NullComponent;
export const NavigationGroup = NullComponent;
export const NavigationItem = NullComponent;
export const NavigationMenu = NullComponent;

// @wordpress/components misc exports
export const FocalPointPicker = NullComponent;
export const PaletteEdit = NullComponent;

// @wordpress/block-editor date picker exports
export const DateFormatPicker = NullComponent;
export const PublishDateTimePicker = NullComponent;
export const PrivatePublishDateTimePicker = NullComponent;

// showdown Markdown converter stub
export class Converter {
	makeHtml( text ) {
		return text;
	}
}

// Default export with Converter for `import showdown from 'showdown'; new showdown.Converter()`
export default { Converter };
