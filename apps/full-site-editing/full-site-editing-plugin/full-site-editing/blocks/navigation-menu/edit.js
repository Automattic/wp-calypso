/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import ServerSideRender from '@wordpress/server-side-render';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */

const NavigationMenuEdit = () => {
	return (
		<Fragment>
			<ServerSideRender block="a8c/navigation-menu" />
		</Fragment>
	);
};

export default NavigationMenuEdit;
