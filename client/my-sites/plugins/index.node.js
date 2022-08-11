import { getLanguageRouteParam } from '@automattic/i18n-utils';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router( [ `/${ langParam }/plugins`, `/${ langParam }/plugins/*` ] );
}
