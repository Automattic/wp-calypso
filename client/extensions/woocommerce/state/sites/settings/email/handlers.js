/**
 * External dependencies
 *
 * @format
 */

import { filter, isEmpty, setWith, get, forEach } from 'lodash';

/**
 * Internal dependencies
 */

import { decodeEntities } from 'lib/formatting';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	WOOCOMMERCE_EMAIL_SETTINGS_RECEIVE,
} from 'woocommerce/state/action-types';
import request from 'woocommerce/state/sites/http-request';

const fromApi = data => {
	const options = {};
	const fromAddress = filter( data, {
		group_id: 'email',
		id: 'woocommerce_email_from_address',
	} );
	const defaultEmail = isEmpty( fromAddress ) ? '' : fromAddress[ 0 ].default;
	data.forEach( function( option ) {
		setWith(
			options,
			[ option.group_id, option.id ],
			{
				value: option.value,
				default: option.default,
			},
			Object
		);
	} );

	forEach( [ 'email_new_order', 'email_cancelled_order', 'email_failed_order' ], key => {
		if ( get( options, [ key, 'enabled', 'value' ] ) !== 'yes' ) {
			return;
		}
		const _default = get( options, [ key, 'recipient', 'default' ] ) || defaultEmail;
		options[ key ].recipient = {
			default: _default,
			value: get( options, [ key, 'recipient', 'value' ] ) || _default,
		};
	} );

	// Decode1: &, <, > entities.
	const from_name = get( options, [ 'email', 'woocommerce_email_from_name', 'value' ], false );
	if ( from_name ) {
		options.email.woocommerce_email_from_name.value = decodeEntities( from_name );
	}

	return options;
};

export const handleRequest = ( { dispatch }, action ) => {
	const { siteId } = action;
	dispatch( request( siteId, action ).get( 'settings_email_groups' ) );
};

export const handleSuccess = ( { dispatch }, action, { data } ) => {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_RECEIVE,
		siteId,
		data: fromApi( data ),
	} );
};

export const handleFailure = ( { dispatch }, action, error ) => {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_RECEIVE,
		siteId,
		error,
	} );
};

export default {
	[ WOOCOMMERCE_EMAIL_SETTINGS_REQUEST ]: [
		dispatchRequest( handleRequest, handleSuccess, handleFailure ),
	],
};
