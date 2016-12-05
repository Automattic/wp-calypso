/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ReaderMain from 'components/reader-main';
import DocumentHead from 'components/data/document-head';

const ReaderFullPostUnavailable = ( { post, translate } ) => {
	return (
		<ReaderMain className="reader-full-post reader-full-post__unavailable">
			<DocumentHead title={ translate( 'Post unavailable' ) } />
				<div className="reader-full-post__content">
					<div className="reader-full-post__story">
						<h1 className="reader-full-post__header-title">{ translate( 'Post unavailable' ) }</h1>
						<p className="reader-full-post__unavailable-message">
							{ translate( 'Sorry, we can\'t display that post right now.' ) }
						</p>
						{ config.isEnabled( 'reader/full-errors' ) ? <pre>{ JSON.stringify( post, null, '  ' ) }</pre> : null }
					</div>
				</div>
		</ReaderMain>
	);
};

ReaderFullPostUnavailable.propTypes = {
	post: React.PropTypes.object.isRequired
};

export default localize( ReaderFullPostUnavailable );
