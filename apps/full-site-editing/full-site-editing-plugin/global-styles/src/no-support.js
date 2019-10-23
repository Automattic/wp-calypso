/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export default ( { unsupportedFeature } ) => (
	<p>{ __( "Your active theme doesn't support this feature: " ) + unsupportedFeature + '.' }</p>
);
