/** @format */

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
import { isEnabled } from 'config';

export default function() {
	if ( isEnabled( 'me/site-block-list' ) ) {
		page( '/me/site-blocks', sidebar, siteBlockList, makeLayout, clientRender );
	}
}
