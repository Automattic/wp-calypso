/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { pricing } from 'landing/jetpack-cloud/sections/pricing/controller';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';

export default function () {
	if ( isJetpackCloud() ) {
		page( '/pricing', pricing, makeLayout, clientRender );
	}
}
