import './init';

import { GUTENBERG_FSE_SETTINGS_REQUEST } from 'calypso/state/action-types';

export const requestCoreFSESettings = ( siteId ) => ( {
	type: GUTENBERG_FSE_SETTINGS_REQUEST,
	siteId,
} );
