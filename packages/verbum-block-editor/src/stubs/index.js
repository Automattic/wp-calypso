/**
 * Consolidated stubs for unused heavy modules.
 *
 * This is a JS file (not TS) because it's used as a replacement for
 * node_modules files that aren't run through the TypeScript loader.
 *
 * These stubs replace large transitive dependencies that aren't needed
 * in the verbum block editor comment context, reducing bundle size by ~50%.
 */

const warned = new Set();

/**
 * Warn if a stub is used.
 * @param {string} name - The name of the stub.
 */
function warnStubUsed( name ) {
	if ( process.env.NODE_ENV !== 'production' && ! warned.has( name ) ) {
		warned.add( name );
		// eslint-disable-next-line no-console
		console.warn( `[verbum-block-editor] Stubbed module invoked: ${ name }` );
	}
}

// Factory for named null components - works for most React component stubs
const createNullComponent = ( name ) => () => {
	warnStubUsed( name );
	return null;
};

// Factory for named no-op functions
const createNoop = ( name ) => () => {
	warnStubUsed( name );
};

// @wordpress/sync exports
export const createSyncProvider = createNoop( 'createSyncProvider' );
export const connectIndexDb = createNoop( 'connectIndexDb' );
export const getSyncProvider = createNoop( 'getSyncProvider' );
export const createWebRTCConnection = createNoop( 'createWebRTCConnection' );

// @wordpress/commands exports
export const store = { name: 'core/commands' };
export const useCommand = createNoop( 'useCommand' );
export const useCommandLoader = createNoop( 'useCommandLoader' );
export const CommandMenu = createNullComponent( 'CommandMenu' );
export const privateApis = {};

// @wordpress/components/calendar exports
export const DateCalendar = createNullComponent( 'DateCalendar' );
export const DateRangeCalendar = createNullComponent( 'DateRangeCalendar' );
export class TZDate extends Date {}

// @wordpress/components/date-time exports
export const DateTimePicker = createNullComponent( 'DateTimePicker' );
export const DatePicker = createNullComponent( 'DatePicker' );
export const TimePicker = createNullComponent( 'TimePicker' );

// @wordpress/components/color-picker exports
export const ColorPicker = createNullComponent( 'ColorPicker' );
export const Picker = createNullComponent( 'Picker' );

// @wordpress/components/navigation exports
export const NavigableMenu = createNullComponent( 'NavigableMenu' );
export const NavigableToolbar = createNullComponent( 'NavigableToolbar' );
export const NavigationBackButton = createNullComponent( 'NavigationBackButton' );
export const NavigationGroup = createNullComponent( 'NavigationGroup' );
export const NavigationItem = createNullComponent( 'NavigationItem' );
export const NavigationMenu = createNullComponent( 'NavigationMenu' );

// @wordpress/components misc exports
export const FocalPointPicker = createNullComponent( 'FocalPointPicker' );
export const PaletteEdit = createNullComponent( 'PaletteEdit' );

// @wordpress/block-editor date picker exports
export const DateFormatPicker = createNullComponent( 'DateFormatPicker' );
export const PublishDateTimePicker = createNullComponent( 'PublishDateTimePicker' );
export const PrivatePublishDateTimePicker = createNullComponent( 'PrivatePublishDateTimePicker' );

// showdown Markdown converter stub
export class Converter {
	makeHtml( text ) {
		warnStubUsed( 'showdown.Converter.makeHtml' );
		return text;
	}
}

// Default export with Converter for `import showdown from 'showdown'; new showdown.Converter()`
export default { Converter };
