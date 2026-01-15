import page from '@automattic/calypso-router';
import {
	A4A_LEARN_LINK,
	A4A_LEARN_RESOURCE_CENTER_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

export default function () {
	page(
		A4A_LEARN_RESOURCE_CENTER_LINK,
		requireAccessContext,
		controller.learnResourceCenterContext,
		makeLayout,
		clientRender
	);
	page( A4A_LEARN_LINK, () => page.redirect( A4A_LEARN_RESOURCE_CENTER_LINK ) );
}
