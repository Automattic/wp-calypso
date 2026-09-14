import page from '@automattic/calypso-router';
import { siteSelection } from 'calypso/my-sites/controller';
import { redirectToJetpackNewsletterSettings } from 'calypso/my-sites/site-settings/settings-controller';

export default function () {
	page( '/settings/newsletter/:site_id', siteSelection, redirectToJetpackNewsletterSettings );
}
