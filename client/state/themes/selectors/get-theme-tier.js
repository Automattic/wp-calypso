import { getThemeTiers } from 'calypso/state/themes/selectors/get-theme-tiers';
import 'calypso/state/themes/init';

export function getThemeTier( state, tierSlug ) {
	return getThemeTiers( state )?.[ tierSlug ] || {};
}
