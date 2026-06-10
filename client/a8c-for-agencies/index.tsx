import page from '@automattic/calypso-router';
import { HelpCenter } from '@automattic/data-stores';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { redirectToLandingContext } from './controller';

// Namespace the persisted Help Center open-state to A4A so that opening the
// Help Center here doesn't leak into (or get overridden by) the shared
// WPCOM/Jetpack user preferences. Must run before any Help Center store read.
HelpCenter.setHelpCenterAppId( 'a4a' );

export default function () {
	page( '/', redirectToLandingContext, makeLayout, clientRender );
}
