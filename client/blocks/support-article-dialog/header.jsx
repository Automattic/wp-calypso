/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ExternalLink from 'calypso/components/external-link';

const SupportArticleHeader = ( { post, isLoading } ) =>
	isLoading || ! post ? (
		<div className="support-article-dialog__header is-placeholder">
			<h1 className="support-article-dialog__header-title is-placeholder">Post loading…</h1>
		</div>
	) : (
		<div className="support-article-dialog__header">
			<h1 className="support-article-dialog__header-title">
				<ExternalLink
					className="support-article-dialog__header-title-link"
					href={ post.URL }
					target="_blank"
					icon={ false }
				>
					{ post.title }
				</ExternalLink>
			</h1>
		</div>
	);

SupportArticleHeader.propTypes = {
	post: PropTypes.object,
	isLoading: PropTypes.bool,
};

export default SupportArticleHeader;
