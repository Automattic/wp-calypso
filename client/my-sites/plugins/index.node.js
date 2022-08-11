import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout } from 'calypso/controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router( [ `/${ langParam }/plugins/*`, `/${ langParam }/plugins` ], makeLayout );
}
