import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import {
	redirectToJetpackNewsletterSettingsIfNeeded,
	siteSettings,
} from 'calypso/my-sites/site-settings/settings-controller';
import { createNewsletterSettings } from './controller';

export default function () {
	page(
		'/settings/newsletter/:site_id',
		siteSelection,
		redirectToJetpackNewsletterSettingsIfNeeded,
		navigation,
		siteSettings,
		createNewsletterSettings,
		makeLayout,
		clientRender
	);
}
