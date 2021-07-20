import { __, sprintf } from '@wordpress/i18n';

export default ( { unsupportedFeature } ) => (
	<p>
		{ sprintf(
			/* translators: %s: feature name (i.e. font pairings, etc) */
			__( "Your active theme doesn't support %s.", 'full-site-editing' ),
			unsupportedFeature
		) }
	</p>
);
