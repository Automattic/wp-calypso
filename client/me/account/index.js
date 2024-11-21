import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	setSelectedSiteIdByOrigin,
	redirectLoggedOut,
} from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { account } from './controller';

export default function () {
	page(
		'/me/account',
		redirectLoggedOut,
		sidebar,
		setSelectedSiteIdByOrigin,
		account,
		makeLayout,
		clientRender
	);
}
