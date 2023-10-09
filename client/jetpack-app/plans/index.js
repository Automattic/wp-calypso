import page from 'page';
import { render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { makeJetpackAppLayout } from '../page-middleware/layout';
import { jetpackAppPlans } from './controller';

export default () => {
	page(
		'/jetpack-app/plans',
		siteSelection,
		navigation,
		jetpackAppPlans,
		makeJetpackAppLayout,
		clientRender
	);
};
