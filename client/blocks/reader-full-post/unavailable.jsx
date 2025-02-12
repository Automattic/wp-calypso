import config from '@automattic/calypso-config';
import { ExternalLink } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import BackButton from 'calypso/components/back-button';
import DocumentHead from 'calypso/components/data/document-head';
import ReaderMain from 'calypso/reader/components/reader-main';

const noop = () => {};

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

	const postPermalink = get( post, [ 'error', 'data', 'permalink' ] );

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
						{ postPermalink && (
							<Fragment>
								<p>
									{ translate( 'The original post is located at:', {
										comment: 'Followed by a URL to the original post on an external site',
									} ) }
								</p>
								<p>
									<ExternalLink href={ postPermalink } icon>
										{ postPermalink }
									</ExternalLink>
								</p>
							</Fragment>
						) }
						{ config.isEnabled( 'reader/full-errors' ) && (
							<pre>{ JSON.stringify( post, null, '  ' ) }</pre>
						) }
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
