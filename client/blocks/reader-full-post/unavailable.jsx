/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import config from 'config';
import { localize } from 'i18n-calypso';
import { noop, get } from 'lodash';

/**
 * Internal dependencies
 */
import ReaderMain from 'reader/components/reader-main';
import DocumentHead from 'components/data/document-head';
import BackButton from 'components/back-button';

const ReaderFullPostUnavailable = ( { post, onBackClick, translate } ) => {
	const statusCode = get( post, [ 'error', 'statusCode' ] );

	let errorTitle = translate( 'Post unavailable' );
	let errorDescription = translate( "Sorry, we can't display that post right now." );
	let errorHelp = null;

	if ( statusCode === 403 ) {
		errorTitle = translate( 'Private post' );
		errorDescription = translate( "This post exists, but you don't have permission to read it." );
		errorHelp = translate(
			"If it's a post on a private site, you need be a member of the site to view the post."
		);
	}

	if ( statusCode === 404 ) {
		errorTitle = translate( 'Post not found' );
	}

	return (
		<ReaderMain className="reader-full-post reader-full-post__unavailable">
			<BackButton onClick={ onBackClick } />
			<DocumentHead title={ translate( 'Post unavailable' ) } />
			<div className="reader-full-post__content">
				<div className="reader-full-post__story">
					<h1 className="reader-full-post__header-title">{ errorTitle }</h1>
					<div className="reader-full-post__unavailable-body">
						<p className="reader-full-post__unavailable-message">{ errorDescription }</p>
						{ errorHelp && <p className="reader-full-post__unavailable-message">{ errorHelp }</p> }
						{ config.isEnabled( 'reader/full-errors' ) ? (
							<pre>{ JSON.stringify( post, null, '  ' ) }</pre>
						) : null }
					</div>
				</div>
			</div>
		</ReaderMain>
	);
};

ReaderFullPostUnavailable.propTypes = {
	post: PropTypes.object.isRequired,
	onBackClick: PropTypes.func.isRequired,
};

ReaderFullPostUnavailable.defaultProps = {
	onBackClick: noop,
};

export default localize( ReaderFullPostUnavailable );
