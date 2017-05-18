/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { extendAction } from 'state/utils';
import {
	failureMeta,
	successMeta,
} from '../../../';

import {
	clearCounts,
	retryOnFailure,
} from '../';

const failer = { type: 'FAIL' };
const succeeder = { type: 'SUCCEED' };

const getSites = {
	method: 'GET',
	path: '/sites',
	apiVersion: 'v1',
	onSuccess: succeeder,
	onFailure: failer,
};

describe( '#retryOnFailure', () => {
	it( 'should pass through initially successful requests', () => {

	} );
} );
