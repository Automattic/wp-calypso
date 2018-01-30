/**
 * External dependencies
 *
 * @format
 */

import { filter, isEmpty, setWith, get, forEach, omit, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import { getEmailSettings } from './selectors';
import { decodeEntities } from 'lib/formatting';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	WOOCOMMERCE_EMAIL_SETTINGS_REQUEST,
	WOOCOMMERCE_EMAIL_SETTINGS_RECEIVE,
	WOOCOMMERCE_EMAIL_SETTINGS_UPDATE,
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

const toApi = settings => {
	// disable if user has emptied the input field
	forEach( [ 'email_new_order', 'email_cancelled_order', 'email_failed_order' ], option => {
		if ( get( settings, [ option, 'recipient', 'value' ] ) === '' ) {
			settings[ option ].enabled.value = 'no';
		}
	} );

	const update = reduce(
		omit( settings, [ 'save', 'isSaving', 'error' ] ),
		( result, options, group_id ) => {
			forEach( options, ( option, id ) => {
				result.push( {
					group_id,
					id,
					value: option.value,
				} );
			} );
			return result;
		},
		[]
	);

	return { update };
};

export const handleRequest = ( { dispatch }, action ) => {
	const { siteId } = action;
	dispatch( request( siteId, action ).get( 'settings_email_groups' ) );
};

export const handleRequestSuccess = ( { dispatch }, action, { data } ) => {
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

export const handleUpdate = ( { dispatch, getState }, action ) => {
	const { siteId } = action;
	const settings = getEmailSettings( getState(), siteId );
	const update = toApi( settings );
	dispatch( request( siteId, action ).post( 'settings/batch', update ) );
};

export const handleUpdateSuccess = ( { dispatch }, action, { data } ) => {
	const { siteId } = action;
	dispatch( {
		type: WOOCOMMERCE_EMAIL_SETTINGS_RECEIVE,
		siteId,
		data: fromApi( data.update ),
	} );
};

export default {
	[ WOOCOMMERCE_EMAIL_SETTINGS_REQUEST ]: [
		dispatchRequest( handleRequest, handleRequestSuccess, handleFailure ),
	],
	[ WOOCOMMERCE_EMAIL_SETTINGS_UPDATE ]: [
		dispatchRequest( handleUpdate, handleUpdateSuccess, handleFailure ),
	],
};
