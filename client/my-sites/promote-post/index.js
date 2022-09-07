import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { promotedPosts } from './controller';

export default () => {
	page(
		'/advertising/:site?/:tab?',
		siteSelection,
		navigation,
		promotedPosts,
		makeLayout,
		clientRender
	);
};
