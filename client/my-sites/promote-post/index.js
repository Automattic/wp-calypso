import { isEnabled } from '@automattic/calypso-config';
import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { promotedPosts } from './controller';

export default () => {
	if ( isEnabled( 'promote-post' ) ) {
		page(
			'/advertising/:site?',
			siteSelection,
			navigation,
			promotedPosts,
			makeLayout,
			clientRender
		);
	} else {
		page.redirect( '/' );
	}
};
