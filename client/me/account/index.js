import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender, setSelectedSiteIdByOrigin } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { maybeRedirectToMultiSiteDashboard } from '../controller';
import { account } from './controller';

export default function () {
	page(
		'/me/account',
		maybeRedirectToMultiSiteDashboard,
		sidebar,
		setSelectedSiteIdByOrigin,
		account,
		makeLayout,
		clientRender
	);
}
