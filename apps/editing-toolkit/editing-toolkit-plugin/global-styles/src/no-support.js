/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

export default ( { unsupportedFeature } ) => (
	<p>
		{
			/* translators: %s: feature name (i.e. font pairings, etc) */
			sprintf(
				__( "Your active theme doesn't support %s.", 'full-site-editing' ),
				unsupportedFeature
			)
		}
	</p>
);
