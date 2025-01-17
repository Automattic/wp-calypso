import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfDuplicatedView as _redirectIfDuplicatedView,
} from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { setScroll, siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { security } from './controller';

const redirectIfDuplicatedView = ( context, next ) => {
	_redirectIfDuplicatedView( 'admin.php?page=jetpack#security' )( context, next );
};

export default function () {
	page(
		'/settings/security/:site_id',
		siteSelection,
		redirectIfDuplicatedView,
		navigation,
		setScroll,
		siteSettings,
		security,
		makeLayout,
		clientRender
	);
}
