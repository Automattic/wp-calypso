import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { a8cForHostsContext } from './controller';

export default function () {
	page( '/', a8cForHostsContext, makeLayout, clientRender );
}
