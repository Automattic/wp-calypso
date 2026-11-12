import page from '@automattic/calypso-router';
import { A4A_PROSPECT_REPORTS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { amplifyContext } from './controller';

export default function () {
	page( A4A_PROSPECT_REPORTS_LINK, requireAccessContext, amplifyContext, makeLayout, clientRender );
	// The page used to live at `/amplify`, and its reports at `/amplify/reports`.
	page( '/amplify', () => page.redirect( A4A_PROSPECT_REPORTS_LINK ) );
	page( '/amplify/*', () => page.redirect( A4A_PROSPECT_REPORTS_LINK ) );
}
