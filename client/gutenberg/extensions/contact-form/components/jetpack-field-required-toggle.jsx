/** @format */

/**
 * External dependencies
 */
import { ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

function JetpackFieldRequiredToggle( props ) {
	return (
		<ToggleControl
			label={ __( 'Required' ) }
			checked={ props.required }
			onChange={ props.onChange }
		/>
	);
}

export default JetpackFieldRequiredToggle;
