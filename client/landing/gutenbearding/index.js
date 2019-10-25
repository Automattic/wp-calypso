/**
 * Global polyfills
 */
import 'boot/polyfills';

/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal dependencies
 */
import user from 'lib/user';
import { Gutenboard } from 'gutenboarding/gutenboard';

/**
 * Style dependencies
 */
import 'assets/stylesheets/style-bare.scss';
import 'components/environment-badge/style.scss';

const gutenbeard = () => {
	ReactDom.render( <Gutenboard />, document.getElementById( 'wpcom' ) );
};

window.AppBoot = async () => {
	await user().initialize();
	page( '/gutenbearding', gutenbeard );
	page.start();
};
