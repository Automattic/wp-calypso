import page from '@automattic/calypso-router';
import {
	A4A_AMPLIFY_LINK,
	A4A_AMPLIFY_LEGACY_LINK,
	A4A_AMPLIFY_REPORTS_LINK,
	A4A_AMPLIFY_REPORTS_LEGACY_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import {
	requireAccessContext,
	requireAmplifyAccessContext,
} from 'calypso/a8c-for-agencies/controller';
import redirectLegacyRoute from 'calypso/a8c-for-agencies/lib/redirect-legacy-route';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { amplifyOverviewContext, amplifyReportsContext } from './controller';

export default function () {
	page(
		A4A_AMPLIFY_LINK,
		requireAccessContext,
		requireAmplifyAccessContext,
		amplifyOverviewContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_AMPLIFY_REPORTS_LINK,
		requireAccessContext,
		requireAmplifyAccessContext,
		amplifyReportsContext,
		makeLayout,
		clientRender
	);

	page( A4A_AMPLIFY_REPORTS_LEGACY_LINK, redirectLegacyRoute( A4A_AMPLIFY_REPORTS_LINK ) );
	page( A4A_AMPLIFY_LEGACY_LINK, redirectLegacyRoute( A4A_AMPLIFY_LINK ) );
}
