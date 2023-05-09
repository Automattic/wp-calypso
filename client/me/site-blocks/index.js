import page from 'page';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { sidebar } from 'calypso/me/controller';
import { siteBlockList } from './controller';

export default function () {
	page( '/me/site-blocks', sidebar, siteBlockList, makeLayout, clientRender );
}
