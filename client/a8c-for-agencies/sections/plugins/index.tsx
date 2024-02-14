import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { pluginsContext } from './controller';

export default function () {
	page( '/plugins', pluginsContext, makeLayout, clientRender );
}
