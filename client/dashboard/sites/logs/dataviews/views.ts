import { LogType, FilterType } from '@automattic/api-core';
import { useState } from '@wordpress/element';
import type { View } from '@wordpress/dataviews';

const phpLogsViewConfig = {
	sortField: 'timestamp',
	titleField: 'severity',
	primaryField: 'severity',
	visibleFields: [ 'timestamp', 'message' ],
	allowedFilters: [ 'severity' ],
	layout: {
		styles: {
			timestamp: { maxWidth: '175px', minWidth: '140px' },
			name: { maxWidth: '200px', minWidth: '75px' },
			message: { maxWidth: '30vw' },
			file: { minWidth: '300px' },
		},
	},
};

const serverLogsViewConfig = {
	sortField: 'date',
	titleField: 'status',
	primaryField: 'severity',
	visibleFields: [ 'date', 'request_type', 'request_url' ],
	allowedFilters: [ 'cached', 'request_type', 'status', 'renderer' ],
	layout: {
		styles: {
			date: { maxWidth: '175px', minWidth: '140px' },
			request_url: { minWidth: '300px' },
			http_referer: { minWidth: '300px' },
		},
	},
};

const activityLogsViewConfig = {
	sortField: 'published',
	titleField: '',
	primaryField: 'event',
	visibleFields: [ 'published', 'event', 'actor' ],
	allowedFilters: [ 'published_utc' ],
	layout: {
		styles: {
			published: { maxWidth: '175px', minWidth: '140px' },
			published_utc: { maxWidth: '175px', minWidth: '140px' },
			summary: { minWidth: '300px' },
			actor: { maxWidth: '150px', minWidth: '75px' },
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

	if ( logType === LogType.ACTIVITY ) {
		return getFilterParamsFromView( view, [] );
	}

	return getFilterParamsFromView( view, [ 'cached', 'request_type', 'status', 'renderer' ] );
}

export function useView( {
	logType,
	initialFilters,
}: {
	logType: LogType;
	initialFilters?: View[ 'filters' ];
} ) {
	let config;
	if ( logType === LogType.PHP ) {
		config = phpLogsViewConfig;
	} else if ( logType === LogType.ACTIVITY ) {
		config = activityLogsViewConfig;
	} else {
		config = serverLogsViewConfig;
	}
	return useState< View >( () => ( {
		type: 'table',
		page: 1,
		perPage: logType === LogType.ACTIVITY ? 20 : 50,
		sort: {
			field: config.sortField,
			direction: 'desc',
		},
		filters: initialFilters ?? [],
		titleField: config.titleField,
		primaryField: config.primaryField,
		fields: config.visibleFields,
		layout: config.layout,
	} ) );
}
