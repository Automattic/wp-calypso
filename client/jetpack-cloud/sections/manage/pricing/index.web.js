import page from '@automattic/calypso-router';
import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import * as controller from './controller';

export default function () {
	const lang = getLanguageRouteParam();

	page(
		`/${ lang }/manage/pricing`,
		setLocaleMiddleware(),
		controller.jetpackManagePricingContext,
		makeLayout,
		clientRender
	);
}
