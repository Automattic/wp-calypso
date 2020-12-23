/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get, isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import SectionHeader from 'calypso/components/section-header';
import ExternalLink from 'calypso/components/external-link';
import { getSiteComment } from 'calypso/state/comments/selectors';

const CommentPermalink = ( { isLoading, permaLink, translate } ) =>
	! isLoading && (
		<Card className="comment__comment-permalink">
			<SectionHeader label={ translate( 'Comment Permalink' ) } />
			<ExternalLink icon href={ permaLink }>
				{ permaLink }
			</ExternalLink>
		</Card>
	);

CommentPermalink.propTypes = {
	siteId: PropTypes.number,
	commentId: PropTypes.number.isRequired,
	isLoading: PropTypes.bool.isRequired,
	permaLink: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { siteId, commentId } ) => {
	const comment = getSiteComment( state, siteId, commentId );

	return {
		isLoading: isUndefined( comment ),
		permaLink: get( comment, 'URL', '' ),
	};
};

export default connect( mapStateToProps )( localize( CommentPermalink ) );
