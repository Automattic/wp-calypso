/**
 * External dependencies
 */
import { reducer } from 'redux-form';

/**
 * Internal dependencies
 */
import { withStorageKey } from 'state/utils';

export default withStorageKey( 'form', reducer );
