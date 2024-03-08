import { THEME_TIERS_UPDATE } from 'calypso/state/themes/action-types';
import 'calypso/state/themes/init';

export const updateThemeTiers = ( tiers = {} ) => ( { type: THEME_TIERS_UPDATE, tiers } );
