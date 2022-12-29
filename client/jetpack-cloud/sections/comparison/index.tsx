import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { loggedInSiteSelection } from 'calypso/my-sites/controller';
import { jetpackComparisonContext } from './controller';

import './style.scss';

export default function () {
	page(
		`/:lang/features/comparison`,
		setLocaleMiddleware(),
		loggedInSiteSelection,
		jetpackComparisonContext,
		makeLayout,
		clientRender
	);

	page(
		'/features/comparison',
		loggedInSiteSelection,
		jetpackComparisonContext,
		makeLayout,
		clientRender
	);
}
