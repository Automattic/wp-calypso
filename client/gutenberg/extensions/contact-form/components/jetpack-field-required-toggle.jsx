/*global wp*/
/** @jsx wp.element.createElement */
/** @format */

/**
 * External dependencies
 */
import { ToggleControl } from '@wordpress/components';

import { __ } from '@wordpress/i18n';

function JetpackFieldRequiredToggle( props ) {
	return (
		<ToggleControl
			label={ __( 'Required', 'jetpack' ) }
			checked={ props.required }
			onChange={ props.onChange }
		/>
	);
}

export default JetpackFieldRequiredToggle;
