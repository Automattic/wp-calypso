import { get } from 'lodash';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';

import 'calypso/state/signup/init';

export function getSiteType( state ) {
	return get( state, 'signup.steps.siteType', '' );
}

export function getSiteTypeId( state, siteType = null ) {
	if ( ! siteType ) {
		siteType = getSiteType( state );
	}
	return getSiteTypePropertyValue( 'slug', siteType, 'id' );
}
