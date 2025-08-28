import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import {
	redirectToJetpackNewsletterSettingsIfNeeded,
	siteSettings,
} from 'calypso/my-sites/site-settings/settings-controller';
import { createNewsletterSettings, jetpackNewsletter } from './controller';

export default function () {
	page(
		'/settings/jetpack-newsletter/:site_id',
		siteSelection,
		navigation,
		siteSettings,
		jetpackNewsletter,
		makeLayout,
		clientRender
	);
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
