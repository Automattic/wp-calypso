import fastDeepEqual from 'fast-deep-equal/es6';
import type { User } from '../data/types';
import type {
	Operator,
	SortDirection,
	ViewTable,
	ViewGrid,
	SupportedLayouts,
} from '@automattic/dataviews';

export const DEFAULT_LAYOUTS: SupportedLayouts = {
	table: {
		showMedia: true,
		mediaField: 'icon.ico',
		titleField: 'name',
		descriptionField: 'URL',
	},
	grid: {
		showMedia: true,
		mediaField: 'preview',
		titleField: 'name',
		descriptionField: 'URL',
	},
};

const DEFAULT_LAYOUT_FIELDS: SupportedLayouts = {
	table: {
		fields: [ 'status', 'visitors', 'subscribers_count' ],
	},
	grid: {
		fields: [ 'status' ],
	},
};

export type SitesView = ViewTable | ViewGrid;

export interface ViewPreferences {
	base?: Partial< SitesView >;
	table?: Partial< ViewTable >;
	grid?: Partial< ViewGrid >;
}

export type ViewSearchParams = Partial< ViewTable | ViewGrid >;

// Preferences that are shared for all view types.
const BASE_VIEW_PREFERENCES_KEYS = [ 'fields', 'perPage', 'showDescription', 'sort', 'type' ];

// Preferences that are specific to a view type.
const TYPE_VIEW_PREFERENCES_KEYS = [ 'layout', 'showMedia' ];

const VIEW_PREFERENCES_KEYS = [ ...BASE_VIEW_PREFERENCES_KEYS, ...TYPE_VIEW_PREFERENCES_KEYS ];
const VIEW_SEARCH_PARAM_KEYS = [ ...VIEW_PREFERENCES_KEYS, 'filters', 'page', 'search' ];

const DEFAULT_PER_PAGE = 10;

const DEFAULT_VIEW: Partial< SitesView > = {
	page: 1,
	perPage: DEFAULT_PER_PAGE,
	sort: { field: 'name', direction: 'asc' as SortDirection },
	search: '',
};

function getDefaultView( {
	user,
	isAutomattician,
	isRestoringAccount,
}: {
	user: User;
	isAutomattician: boolean;
	isRestoringAccount: boolean;
} ): SitesView {
	const type = isRestoringAccount || user.site_count > DEFAULT_PER_PAGE ? 'table' : 'grid';

	const defaultView = {
		type,
		...DEFAULT_VIEW,
		...DEFAULT_LAYOUTS[ type ],
		...DEFAULT_LAYOUT_FIELDS[ type ],
	} as SitesView;

	if ( isAutomattician ) {
		defaultView.filters = [
			{
				field: 'is_a8c',
				operator: 'is' as Operator,
				value: false,
			},
		];
	}

	return defaultView;
}

export function getView( {
	user,
	isAutomattician,
	isRestoringAccount,
	viewPreferences,
	viewSearchParams,
}: {
	user: User;
	isAutomattician: boolean;
	isRestoringAccount: boolean;
	viewPreferences?: ViewPreferences;
	viewSearchParams: ViewSearchParams;
} ): {
	defaultView: SitesView;
	view: SitesView;
} {
	const defaultView = getDefaultView( {
		user,
		isAutomattician,
		isRestoringAccount,
	} );

	const type = viewSearchParams.type || viewPreferences?.base?.type || defaultView.type;

	const view = {
		...defaultView,
		...DEFAULT_LAYOUTS[ type ],
		...DEFAULT_LAYOUT_FIELDS[ type ],
		...viewPreferences?.base,
		...viewPreferences?.[ type ],
		...viewSearchParams,
	} as SitesView;

	return {
		defaultView,
		view,
	};
}

export function getUpdatedView( {
	defaultView,
	view,
	viewPreferences,
	nextView,
}: {
	defaultView: SitesView;
	view: SitesView;
	viewPreferences?: ViewPreferences;
	nextView: SitesView;
} ): {
	updatedViewPreferences: ViewPreferences;
	updatedViewSearchParams: ViewSearchParams;
} {
	const nextType = nextView.type;

	const defaultNextView = {
		...defaultView,
		...DEFAULT_LAYOUTS[ nextType ],
		...DEFAULT_LAYOUT_FIELDS[ nextType ],
	} as SitesView;

	let updatedView = nextView;
	if ( nextType !== view.type ) {
		updatedView = {
			...updatedView,

			// Merge with the previously-stored type-specific preferences.
			...pickFields( viewPreferences?.[ nextType ] || {}, TYPE_VIEW_PREFERENCES_KEYS ),
		} as SitesView;

		if ( ! viewPreferences?.base?.fields ) {
			updatedView = {
				...updatedView,

				// Reset the fields to the type's default fields.
				...DEFAULT_LAYOUT_FIELDS[ nextType ],
			} as SitesView;
		}
	}

	const updatedViewPreferences = {
		...viewPreferences,

		// Store only fields which have different values than the default ones.
		base: pickNonDefaultFields( updatedView, BASE_VIEW_PREFERENCES_KEYS, defaultNextView ),

		// Store only fields which have different values than the default ones.
		[ nextType ]: pickNonDefaultFields( updatedView, TYPE_VIEW_PREFERENCES_KEYS, defaultNextView ),
	} as ViewPreferences;

	const updatedViewSearchParams = {
		// Show only params which have different values than the default ones.
		...pickNonDefaultFields( updatedView, VIEW_SEARCH_PARAM_KEYS, defaultNextView ),

		// Show the type param explicitly to ensure the view type is updated immediately.
		type: nextType,
	} as ViewSearchParams;

	return {
		updatedViewPreferences,
		updatedViewSearchParams,
	};
}

function pickFields( object: Partial< SitesView >, keys: string[] ) {
	return Object.fromEntries(
		Object.entries( object ).filter( ( [ key ] ) => keys.includes( key ) )
	);
}

function pickNonDefaultFields(
	object: Partial< SitesView >,
	keys: string[],
	defaultValues: Partial< SitesView >
) {
	return Object.fromEntries(
		Object.entries( object ).filter(
			( [ key, value ] ) =>
				keys.includes( key ) &&
				! fastDeepEqual( value, defaultValues[ key as keyof typeof defaultValues ] )
		)
	);
}
