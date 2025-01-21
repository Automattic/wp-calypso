import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	redirectIfDuplicatedSettingsView,
} from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { discussion } from './controller';

export default function () {
	page(
		'/settings/discussion/:site_id',
		siteSelection,
		redirectIfDuplicatedSettingsView( 'options-discussion.php' ),
		navigation,
		siteSettings,
		discussion,
		makeLayout,
		clientRender
	);
}
