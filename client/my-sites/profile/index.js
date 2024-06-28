import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection } from 'calypso/my-sites/controller';
import profileController from './controller';

export default function () {
	page(
		'/profile/:site_id',
		profileController.enforceSiteEnding,
		siteSelection,
		navigation,
		profileController.personSiteLevelProfile,
		makeLayout,
		clientRender
	);
}
