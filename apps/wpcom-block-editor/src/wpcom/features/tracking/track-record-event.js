/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { isObjectLike, isUndefined, omit } from 'lodash';
import debug from 'debug';

const tracksDebug = debug( 'wpcom-block-editor:analytics:tracks' );

// In case Tracks hasn't loaded.
if ( typeof window !== 'undefined' ) {
	window._tkq = window._tkq || [];
}

// Adapted from the analytics lib :(
// Because this is happening outside of the Calypso app we can't reuse the same lib
// This means we don't have any extra props like user

export default ( eventName, eventProperties ) => {
	/*
	 * Custom Properties.
	 * Required by Tracks when added manually.
	 */
	const customProperties = {
		blog_id: window._currentSiteId,
		site_type: window._currentSiteType,
		user_locale: window._currentUserLocale,
	};

	eventProperties = eventProperties || {};

	if ( process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' ) {
		for ( const key in eventProperties ) {
			if ( isObjectLike( eventProperties[ key ] ) ) {
				const errorMessage =
					`Tracks: Unable to record event "${ eventName }" because nested ` +
					`properties are not supported by Tracks. Check '${ key }' on`;
				console.error( errorMessage, eventProperties ); //eslint-disable-line no-console
				return;
			}

			if ( ! /^[a-z_][a-z0-9_]*$/.test( key ) ) {
				//eslint-disable-next-line no-console
				console.error(
					'Tracks: Event `%s` will be rejected because property name `%s` does not match /^[a-z_][a-z0-9_]*$/. ' +
						'Please use a compliant property name.',
					eventName,
					key
				);
			}
		}
	}

	// Remove properties that have an undefined value
	// This allows a caller to easily remove properties from the recorded set by setting them to undefined
	eventProperties = omit( eventProperties, isUndefined );

	// Populate custom properties.
	eventProperties = { ...eventProperties, ...customProperties };

	tracksDebug( 'Recording event %o with actual props %o', eventName, eventProperties );

	window._tkq.push( [ 'recordEvent', eventName, eventProperties ] );
};
