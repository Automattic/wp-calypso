import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { redirectToLandingContext } from './controller';

export default function () {
	page( '/', redirectToLandingContext, makeLayout, clientRender );
}
