import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { jetpackAppPlans } from './controller';

export default () => {
	page(
		'/jetpack-app-plans',
		siteSelection,
		navigation,
		jetpackAppPlans,
		makeLayout,
		clientRender
	);
};
