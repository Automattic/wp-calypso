import page from 'page';
import { render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { jetpackAppPlans } from './controller';
import { makeJetpackAppLayout } from './page-middleware/layout';

export default () => {
	page(
		'/jetpack-app-plans',
		siteSelection,
		navigation,
		jetpackAppPlans,
		makeJetpackAppLayout,
		clientRender
	);
};
