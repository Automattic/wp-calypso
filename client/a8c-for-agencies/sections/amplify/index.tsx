import page from '@automattic/calypso-router';
import {
	A4A_AMPLIFY_LINK,
	A4A_AMPLIFY_REPORTS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { amplifyOverviewContext, amplifyReportsContext } from './controller';

export default function () {
	page( A4A_AMPLIFY_LINK, requireAccessContext, amplifyOverviewContext, makeLayout, clientRender );
	page(
		A4A_AMPLIFY_REPORTS_LINK,
		requireAccessContext,
		amplifyReportsContext,
		makeLayout,
		clientRender
	);
}
