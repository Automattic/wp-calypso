import page from '@automattic/calypso-router';
import {
	makeLayout,
	render as clientRender,
	setGloballySelectedSiteIdByOrigin,
} from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { account } from './controller';

export default function () {
	page(
		'/me/account',
		sidebar,
		setGloballySelectedSiteIdByOrigin,
		account,
		makeLayout,
		clientRender
	);
}
