import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import { setScroll, siteSettings } from 'calypso/my-sites/site-settings/settings-controller';
import { security } from './controller';

export default function () {
	page(
		'/settings/security/:site_id',
		siteSelection,
		navigation,
		setScroll,
		siteSettings,
		security,
		makeLayout,
		clientRender
	);
}
