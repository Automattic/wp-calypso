import type { User } from '../data/types';
import type {
	Operator,
	SortDirection,
	View,
	ViewTable,
	ViewGrid,
	SupportedLayouts,
} from '@automattic/dataviews';

export const DEFAULT_LAYOUTS: SupportedLayouts = {
	table: {
		mediaField: 'icon.ico',
		fields: [ 'status', 'visitors', 'subscribers_count', 'wp_version' ],
		titleField: 'name',
		descriptionField: 'URL',
	},
	grid: {
		mediaField: 'preview',
		fields: [ 'status' ],
		titleField: 'name',
		descriptionField: 'URL',
	},
};

export const PERSISTABLE_VIEW_KEYS = [
	'density',
	'fields',
	'layout',
	'perPage',
	'previewSize',
	'showDescription',
	'showMedia',
	'sort',
	'type',
];

export const CONFIGURABLE_VIEW_KEYS = [ ...PERSISTABLE_VIEW_KEYS, 'filters', 'page', 'search' ];

const DEFAULT_PER_PAGE = 10;

const DEFAULT_VIEW = {
	page: 1,
	perPage: DEFAULT_PER_PAGE,
	sort: { field: 'name', direction: 'asc' as SortDirection },
	search: '',
} as Partial< View >;

function getDefaultView( {
	user,
	isAutomattician,
	isRestoringAccount,
}: {
	user: User;
	isAutomattician: boolean;
	isRestoringAccount: boolean;
} ): View {
	const type = isRestoringAccount || user.site_count > DEFAULT_PER_PAGE ? 'table' : 'grid';

	const defaultView = {
		type,
		...DEFAULT_VIEW,
		...DEFAULT_LAYOUTS[ type ],
	} as View;

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
	viewOptions,
	viewPreferences,
}: {
	user: User;
	isAutomattician: boolean;
	isRestoringAccount: boolean;
	viewOptions: Partial< ViewTable | ViewGrid >;
	viewPreferences?: Partial< View >;
} ): {
	defaultView: View;
	view: View;
} {
	const defaultView = getDefaultView( {
		user,
		isAutomattician,
		isRestoringAccount,
	} );

	const type = viewOptions.type || viewPreferences?.type || defaultView.type;
	const view = {
		...defaultView,
		...DEFAULT_LAYOUTS[ type ],
		...viewPreferences,
		...Object.fromEntries( Object.entries( viewOptions ).filter( ( [ , v ] ) => v !== undefined ) ),
	} as View;

	return { defaultView, view };
}
