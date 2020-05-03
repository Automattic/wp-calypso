/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { siteBlockList } from './controller';
import { makeLayout, render as clientRender } from 'controller';
import { sidebar } from 'me/controller';

export default function () {
	page( '/me/site-blocks', sidebar, siteBlockList, makeLayout, clientRender );
}
