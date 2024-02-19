import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { redirectToOverviewContext } from './controller';

export default function () {
	page( '/', redirectToOverviewContext, makeLayout, clientRender );
}
