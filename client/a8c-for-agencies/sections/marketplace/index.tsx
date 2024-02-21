import page from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { marketplaceContext } from './controller';

export default function () {
	page( '/marketplace', marketplaceContext, makeLayout, clientRender );
}
