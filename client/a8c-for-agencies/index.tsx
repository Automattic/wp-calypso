import page from '@automattic/calypso-router';
import { HelpCenter } from '@automattic/data-stores';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { redirectToLandingContext } from './controller';

// Must run before any Help Center store read.
HelpCenter.setHelpCenterAppId( 'a4a' );

export default function () {
	page( '/', redirectToLandingContext, makeLayout, clientRender );
}
