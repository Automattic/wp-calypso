import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import * as controller from './controller';

export default function () {
	page( '/manage/pricing', controller.jetpackManagePricingContext, makeLayout, clientRender );

	page(
		'/:lang/manage/pricing',
		setLocaleMiddleware(),
		controller.jetpackManagePricingContext,
		makeLayout,
		clientRender
	);
}
