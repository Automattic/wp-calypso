import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	maybeRemoveCheckoutSuccessNotice,
	sanitizeQueryParameters,
	sitesDashboard,
} from './controller';

export default function () {
	page(
		'/sites',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		sitesDashboard,
		makeLayout,
		clientRender
	);

	page(
		'/sites/:siteUrl/:feature',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		sitesDashboard,
		makeLayout,
		clientRender
	);

	page(
		'/sites/:siteUrl',
		maybeRemoveCheckoutSuccessNotice,
		sanitizeQueryParameters,
		sitesDashboard,
		makeLayout,
		clientRender
	);
}
