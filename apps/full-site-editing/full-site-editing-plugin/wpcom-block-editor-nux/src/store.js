/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { plugins, registerStore, use } from '@wordpress/data';

use( plugins.persistence, {} );

const reducer = ( state = {}, { type, isNuxEnabled } ) =>
	'WPCOM_BLOCK_EDITOR_NUX_SET_STATUS' === type ? { ...state, isNuxEnabled } : state;

const actions = {
	setWpcomNuxStatus: isNuxEnabled => ( {
		type: 'WPCOM_BLOCK_EDITOR_NUX_SET_STATUS',
		isNuxEnabled,
	} ),
};

const selectors = {
	isWpcomNuxEnabled: state => state.isNuxEnabled,
};

registerStore( 'automattic/nux', {
	reducer,
	actions,
	selectors,
	persist: true,
} );
