/**
 * External dependencies
 */
import page from '@automattic/calypso-router';
/**
 * Internal dependencies
 */
import { render as clientRender } from 'calypso/controller';
import { reauthRequired, makeReauthLayout } from './controller';

export default function () {
	page( '/reauth-required', reauthRequired, makeReauthLayout, clientRender );
}
