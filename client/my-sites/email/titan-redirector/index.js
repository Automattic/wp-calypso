/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import * as paths from 'calypso/my-sites/email/paths';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default function () {
	page(
		paths.emailManagementTitanExternal( ':environment', ':orderId', ':linkType' ),
		controller.emailTitanAddMailboxes,
		makeLayout,
		clientRender
	);
}
