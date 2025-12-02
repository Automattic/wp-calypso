import { LogType, FilterType } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export const DEFAULT_PER_PAGE = 50;

const DEFAULT_VIEW = {
	type: 'table',
	perPage: DEFAULT_PER_PAGE,
	infiniteScrollEnabled: true,
	showLevels: false,
} satisfies Partial< View >;

export const DEFAULT_PHP_LOGS_VIEW: View = {
	...DEFAULT_VIEW,
	sort: {
		field: 'timestamp',
		direction: 'desc',
	},
	fields: [ 'severity', 'timestamp', 'message' ],
	layout: {
		density: 'balanced',
		styles: {
			timestamp: { maxWidth: '300px', minWidth: '140px' },
			name: { maxWidth: '200px', minWidth: '75px' },
			message: { maxWidth: '30vw' },
			file: { minWidth: '300px' },
		},
	},
};

export const DEFAULT_SERVER_LOGS_VIEW: View = {
	...DEFAULT_VIEW,
	fields: [ 'status', 'date', 'request_type', 'request_url' ],
	sort: {
		field: 'date',
		direction: 'desc',
	},
	layout: {
		density: 'balanced',
		styles: {
			date: { maxWidth: '300px', minWidth: '140px' },
			request_url: { minWidth: '300px' },
			http_referer: { minWidth: '300px' },
		},
	},
};

// Convert current view filters to API filter params
const getFilterParamsFromView = ( view: View, fieldNames: string[] ): FilterType => {
	const allowed = new Set( fieldNames );
	const out: FilterType = {};

	for ( const filter of view.filters ?? [] ) {
		if ( ! allowed.has( filter.field ) ) {
			continue;
		}

		const raw = Array.isArray( filter.value ) ? filter.value : [];
		const values = Array.from( new Set( raw.map( String ) ) )
			.filter( Boolean )
			.sort();

		if ( values.length ) {
			out[ filter.field ] = values;
		}
	}

	return out;
};

export function toFilterParams( { view, logType }: { view: View; logType: LogType } ): FilterType {
	if ( logType === LogType.PHP ) {
		return getFilterParamsFromView( view, [ 'severity' ] );
	}

	return getFilterParamsFromView( view, [ 'cached', 'request_type', 'status', 'renderer' ] );
}
