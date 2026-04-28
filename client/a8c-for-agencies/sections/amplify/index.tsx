import page from '@automattic/calypso-router';
import { A4A_AMPLIFY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { amplifyContext } from './controller';

export default function () {
	page( A4A_AMPLIFY_LINK, requireAccessContext, amplifyContext, makeLayout, clientRender );
}
