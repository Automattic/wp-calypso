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

// @wordpress/sync exports. core-data only creates a sync manager when real-time collaboration is
// enabled, and subclasses Awareness when it loads.
export const createSyncManager = createNoop( 'createSyncManager' );
export const retrySyncConnection = createNoop( 'retrySyncConnection' );
export class Awareness {}
export class Delta {}
export const Y = {};
export const ConnectionErrorCode = {};
export const CRDT_DOC_META_PERSISTENCE_KEY = 'CRDT_DOC_META_PERSISTENCE_KEY';
export const CRDT_RECORD_MAP_KEY = 'CRDT_RECORD_MAP_KEY';
export const LOCAL_EDITOR_ORIGIN = 'LOCAL_EDITOR_ORIGIN';
export const LOCAL_UNDO_IGNORED_ORIGIN = 'LOCAL_UNDO_IGNORED_ORIGIN';

// @wordpress/date exports. dataviews reads getSettings().formats when it loads.
export const getSettings = () => ( { formats: {}, timezone: {}, l10n: {} } );
export const getDate = createNoop( 'getDate' );
export const dateI18n = createNoop( 'dateI18n' );

// date-fns and date-fns/locale exports, used by dataviews' date fields and ui's calendar
export const areIntervalsOverlapping = createNoop( 'areIntervalsOverlapping' );
export const differenceInCalendarDays = createNoop( 'differenceInCalendarDays' );
export const endOfMonth = createNoop( 'endOfMonth' );
export const format = createNoop( 'format' );
export const isSameMonth = createNoop( 'isSameMonth' );
export const isValid = createNoop( 'isValid' );
export const parse = createNoop( 'parse' );
export const parseISO = createNoop( 'parseISO' );
export const startOfMonth = createNoop( 'startOfMonth' );
export const startOfYear = createNoop( 'startOfYear' );
export const subDays = createNoop( 'subDays' );
export const subMonths = createNoop( 'subMonths' );
export const subWeeks = createNoop( 'subWeeks' );
export const subYears = createNoop( 'subYears' );
export const enUS = {};

// react-day-picker exports, used by ui's calendar
export const DayPicker = createNullComponent( 'DayPicker' );
export const useDayPicker = createNoop( 'useDayPicker' );
export const rangeContainsModifiers = createNoop( 'rangeContainsModifiers' );

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

// @wordpress/block-editor inserter media tab
export const MediaTab = createNullComponent( 'MediaTab' );

// @wordpress/block-editor date picker exports
export const DateFormatPicker = createNullComponent( 'DateFormatPicker' );
export const PublishDateTimePicker = createNullComponent( 'PublishDateTimePicker' );
export const PrivatePublishDateTimePicker = createNullComponent( 'PrivatePublishDateTimePicker' );

// marked Markdown converter stub
export class Marked {
	parse( text ) {
		warnStubUsed( 'marked.parse' );
		return text;
	}
}

// Default export for stubbed modules imported by default, such as react-easy-crop
export default {};
