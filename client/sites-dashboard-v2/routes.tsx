import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation } from 'calypso/my-sites/controller';
import {
	maybeRemoveCheckoutSuccessNotice,
	sanitizeQueryParameters,
} from '../sites-dashboard/controller';
import { sitesDashboard } from './controller';

export default function () {
	page(
		'/sites',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		navigation,
		sitesDashboard,
		makeLayout,
		clientRender
	);
}
