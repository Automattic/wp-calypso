/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

const ReaderFullPostHeaderPlaceholder = ( { translate } ) => {
	return (
		<div className="reader-full-post__header is-placeholder">
			<h1 className="reader-full-post__header-title is-placeholder">{ translate( 'Post loading…' ) }</h1>
			<div className="reader-full-post__header-meta">
				<span className="reader-full-post__header-date is-placeholder">
					{ translate( 'Post date' ) }
				</span>
			</div>
		</div>
	);
};

export default localize( ReaderFullPostHeaderPlaceholder );
