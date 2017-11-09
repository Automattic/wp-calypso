/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import ExternalLink from 'components/external-link';
import { getSiteComment } from 'state/selectors';

const CommentPermailnk = ( { permaLink, translate } ) => (
	<Card className="comment__comment-permalink">
		<SectionHeader label={ translate( 'Comment Permalink' ) } />
		<ExternalLink icon={ true } href={ permaLink }>
			{ permaLink }
		</ExternalLink>
	</Card>
);

CommentPermailnk.propTypes = {
	siteId: PropTypes.number.isRequired,
	commentId: PropTypes.number.isRequired,
	permaLink: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

const mapStateToProps = ( state, { siteId, commentId } ) => {
	const comment = getSiteComment( state, siteId, commentId );

	return {
		permaLink: get( comment, 'URL', '' ),
	};
};

export default connect( mapStateToProps )( localize( CommentPermailnk ) );
