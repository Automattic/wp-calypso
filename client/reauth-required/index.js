/**
 * External dependencies
 */
import page from '@automattic/calypso-router';
/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller';
import { reauthRequired } from './controller';

export default function () {
	page( '/reauth-required', reauthRequired, makeLayout, clientRender );
}
