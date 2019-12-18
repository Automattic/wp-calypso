/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { plugins, registerStore, use } from '@wordpress/data';

use( plugins.persistence, {} );

const reducer = ( state = {}, { type, isNuxEnabled } ) =>
	'WPCOM_BLOCK_EDITOR_NUX_SET_STATUS' === type ? { ...state, isNuxEnabled } : state;

const actions = {
	setWpcomNuxStatus: ( isNuxEnabled, bypassApi ) => {
		if ( ! bypassApi ) {
			apiFetch( {
				path: 'fse/v1/wpcom-block-editor/nux',
				method: 'POST',
				data: { isNuxEnabled },
			} );
		}
		return {
			type: 'WPCOM_BLOCK_EDITOR_NUX_SET_STATUS',
			isNuxEnabled,
		};
	},
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
