/** @format */

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveSiteOption } from 'state/sites/actions';
import { SITE_OPTION_FETCH } from 'state/action-types';

/**
 * `null` schema allows anything.
 * We'll rely on error handling in the simple transformer
 */
const fromApi = makeJsonSchemaParser( true, ( { option_value } ) => ( {
	optionValue: option_value,
} ) );

function fetch( action ) {
	return http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: `/sites/${ action.siteId }/option`,
			query: {
				option_name: action.optionName,
			},
		},
		action
	);
}

function onSuccess( { siteId, optionName }, { optionValue } ) {
	return receiveSiteOption( siteId, optionName, optionValue );
}

export default {
	[ SITE_OPTION_FETCH ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			fromApi,
		} ),
	],
};
