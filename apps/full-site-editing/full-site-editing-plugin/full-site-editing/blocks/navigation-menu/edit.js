/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { ServerSideRender } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */

const NavigationMenuEdit = ( { attributes } ) => {
	return (
		<Fragment>
			<ServerSideRender attributes={ attributes } block="a8c/navigation-menu" />
		</Fragment>
	);
};

export default NavigationMenuEdit;
