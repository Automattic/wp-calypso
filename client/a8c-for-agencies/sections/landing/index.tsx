import page from '@automattic/calypso-router';
import { A4A_LANDING_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { landingContext } from './controller';

export default function () {
	page( A4A_LANDING_LINK, landingContext, makeLayout, clientRender );
}
