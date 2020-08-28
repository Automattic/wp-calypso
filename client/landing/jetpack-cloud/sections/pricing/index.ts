/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { pricing } from 'landing/jetpack-cloud/sections/pricing/controller';

export default function () {
	page( '/pricing', pricing, makeLayout, clientRender );
}
