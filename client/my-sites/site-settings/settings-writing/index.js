import page from '@automattic/calypso-router';
import {
	makeLayout,
	redirectIfDuplicatedView as _redirectIfDuplicatedView,
	render as clientRender,
} from 'calypso/controller';
import { siteSelection } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';

export default function () {
	page(
		'/settings/writing/:site_id',
		siteSelection,
		_redirectIfDuplicatedView( 'options-writing.php' ),
		siteSettings,
		makeLayout,
		clientRender
	);
}
