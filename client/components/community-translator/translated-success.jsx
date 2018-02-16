/** @format */
/**
 * External dependencies
 */
import React from 'react';

const TranslatedSuccess = ( { translationUrl } ) => (
	<div className="community-translator__success">
		<p>Thanks for contributing!</p>
		<p>
			Your translation has been submitted. You can view it on{' '}
			<a href={ translationUrl } target="_blank">
				translate.wordpress.com
			</a>.
		</p>
	</div>
);

export default TranslatedSuccess;
