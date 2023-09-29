const KNOWN_FILTER_OPTIONS = [
	'action',
	'after',
	'aggregate',
	'before',
	'by',
	'dateRange',
	'group',
	'name',
	'notGroup',
	'number',
	'on',
	'sortOrder',
	'textSearch',
];

export function getFilterKey( filter ) {
	return KNOWN_FILTER_OPTIONS.filter( ( opt ) => filter[ opt ] !== undefined )
		.map( ( opt ) => {
			const optionValue = filter[ opt ];
			const cacheKeyValue = Array.isArray( optionValue )
				? optionValue.slice().sort().join( ',' )
				: optionValue;
			return `${ opt }=${ cacheKeyValue }`;
		} )
		.join( '-' );
}
