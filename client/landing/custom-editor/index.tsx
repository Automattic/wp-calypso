/**
 * External dependencies
 */
import config from '../../config';
import { initialize } from '@wordpress/edit-site';

/**
 * Internal dependencies
 */
import './utils';

window.AppBoot = () => {
	if ( ! config.isEnabled( 'custom-editor' ) ) {
		window.location.href = '/';
	} else {
		initialize( 'wpcom', {} );
	}
};
