import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { discover } from './controller';

export default function () {
	page( '/discover', updateLastRoute, sidebar, discover, makeLayout, clientRender );
}
