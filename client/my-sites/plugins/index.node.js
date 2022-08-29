import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { ssrSetupLocale } from 'calypso/controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router( [ `/${ langParam }/plugins`, `/${ langParam }/plugins/*` ], ssrSetupLocale );
}
