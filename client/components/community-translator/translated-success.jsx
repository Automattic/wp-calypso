/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

const TranslatedSuccess = ( { translationUrl, translate } ) => (
	<div className="community-translator__success">
		<p>{ translate( 'Thanks for contributing!' ) }</p>
		{ translationUrl && (
			<p>
				{ translate( 'Your translation has been submitted. You can view it on ' ) }
				<a href={ translationUrl } target="_blank" rel="noopener noreferrer">
					translate.wordpress.com
				</a>.
			</p>
		) }
	</div>
);

export default localize( TranslatedSuccess );
