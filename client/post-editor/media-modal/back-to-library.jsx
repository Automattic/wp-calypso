/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/* eslint-disable wpcalypso/jsx-classname-namespace */

const BackToLibrary = ( { translate } ) => (
	<span className="editor-media-modal__back-to-library">
		<span className="is-mobile">{ translate( 'Library' ) }</span>
		<span className="is-desktop">{ translate( 'Media Library' ) }</span>
	</span>
);

BackToLibrary.displayName = 'BackToLibrary';

export default localize( BackToLibrary );
