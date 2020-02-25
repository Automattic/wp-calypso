/**
 * External dependencies
 */
import config from '../../config';
import { initialize } from '@wordpress/edit-site';

window.AppBoot = () => {
	if ( ! config.isEnabled( 'custom-editor' ) ) {
		window.location.href = '/';
	} else {
		initialize( 'wpcom', {} );
	}
};
