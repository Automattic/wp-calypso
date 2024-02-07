import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { jetpackManagePricingPath } from 'calypso/lib/jetpack/paths';
import * as controller from './controller';

export default function () {
	page(
		jetpackManagePricingPath(),
		controller.jetpackManagePricingContext,
		makeLayout,
		clientRender
	);
}
