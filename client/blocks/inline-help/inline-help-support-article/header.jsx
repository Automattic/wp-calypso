/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';

const ReaderFullPostHeader = ( { post, isLoading } ) =>
	isLoading || ! post ? (
		<div className="inline-help-support-article__header is-placeholder">
			<h1 className="inline-help-support-article__header-title is-placeholder">Post loading…</h1>
		</div>
	) : (
		<div className="inline-help-support-article__header">
			<h1 className="inline-help-support-article__header-title">
				<ExternalLink
					className="inline-help-support-article__header-title-link"
					href={ post.URL }
					target="_blank"
					icon={ false }
				>
					{ post.title }
				</ExternalLink>
			</h1>
		</div>
	);

ReaderFullPostHeader.propTypes = {
	post: PropTypes.object,
	isLoading: PropTypes.bool,
};

export default ReaderFullPostHeader;
