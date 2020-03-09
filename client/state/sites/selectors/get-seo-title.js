/**
 * External dependencies
 */
import { has } from 'lodash';

/**
 * Internal dependencies
 */
import getSeoTitleFormats from 'state/sites/selectors/get-seo-title-formats';
import buildSeoTitle from 'state/sites/selectors/build-seo-title';

import 'state/sites/init';

export default ( state, type, data ) => {
	if ( ! has( data, 'site.ID' ) ) {
		return '';
	}

	const titleFormats = getSeoTitleFormats( state, data.site.ID );

	return buildSeoTitle( titleFormats, type, data );
};
