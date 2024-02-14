import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { resourcesContext } from './controller';

export default function () {
	page( '/resources', resourcesContext, makeLayout, clientRender );
}
