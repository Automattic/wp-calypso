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

const DEFAULT_PER_PAGE = 10;

const DEFAULT_VIEW = {
	page: 1,
	perPage: DEFAULT_PER_PAGE,
	sort: { field: 'name', direction: 'asc' as SortDirection },
	search: '',
} as View;

function getDefaultView( {
	user,
	isAutomattician,
	isRestoringAccount,
}: {
	user: User;
	isAutomattician?: boolean;
	isRestoringAccount?: boolean;
} ): View {
	const defaultView = { ...DEFAULT_VIEW };

	if ( isAutomattician ) {
		defaultView.filters = [
			{
				field: 'is_a8c',
				operator: 'is' as Operator,
				value: false,
			},
		];
	}

	if ( isRestoringAccount || user.site_count > DEFAULT_PER_PAGE ) {
		defaultView.type = 'table' as const;
	} else {
		defaultView.type = 'grid' as const;
	}

	return {
		...defaultView,
		...DEFAULT_LAYOUTS[ defaultView.type ],
	} as View;
}

export function getView( {
	user,
	isAutomattician,
	isRestoringAccount,
	viewOptions,
}: {
	user: User;
	isAutomattician?: boolean;
	isRestoringAccount?: boolean;
	viewOptions?: Partial< ViewTable | ViewGrid >;
} ): {
	defaultView: View;
	view: View;
} {
	const defaultView = getDefaultView( { user, isAutomattician, isRestoringAccount } );

	return {
		defaultView,
		view: {
			...defaultView,
			...DEFAULT_LAYOUTS[ viewOptions?.type ?? defaultView.type ],
			...( viewOptions
				? Object.fromEntries(
						Object.entries( viewOptions ).filter( ( [ , v ] ) => v !== undefined )
				  )
				: {} ),
		} as View,
	};
}
