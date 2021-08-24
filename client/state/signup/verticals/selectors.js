import { get } from 'lodash';

import 'calypso/state/signup/init';

export const getVerticals = ( state, searchTerm = '', siteType = '' ) =>
	get( state, [ 'signup', 'verticals', siteType, searchTerm.trim().toLowerCase() ], null );
