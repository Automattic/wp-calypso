import 'calypso/state/themes/init';

export function getThemeTiers( state ) {
	return state?.themes?.themeFilters?.tier || {};
}
