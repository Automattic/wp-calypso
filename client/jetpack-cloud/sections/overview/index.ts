import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { overviewPath } from 'calypso/lib/jetpack/paths';
import { navigation } from 'calypso/my-sites/controller';
import * as controller from './controller';

export default function () {
	page(
		overviewPath(),
		navigation,
		controller.requireAccessContext,
		controller.overviewContext,
		makeLayout,
		clientRender
	);
}
