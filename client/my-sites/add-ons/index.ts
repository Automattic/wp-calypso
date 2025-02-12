import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import {
	siteSelection,
	stagingSiteNotSupportedRedirect,
	sites,
	navigation,
} from 'calypso/my-sites/controller';
import { addOnsSiteSelectionHeader, addOnsManagement } from './controller';

const commonHandlers = [
	stagingSiteNotSupportedRedirect,
	siteSelection,
	addOnsSiteSelectionHeader,
];

export default function () {
	page( '/add-ons', ...commonHandlers, sites, makeLayout, clientRender );
	page(
		'/add-ons/:site',
		...commonHandlers,
		navigation,
		addOnsManagement,
		makeLayout,
		clientRender
	);
}
