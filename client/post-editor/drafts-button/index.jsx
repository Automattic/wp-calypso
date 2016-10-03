/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Count from 'components/count';
import QueryPosts from 'components/data/query-posts';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSitePostsForQuery } from 'state/posts/selectors';

function EditorDraftsButton( { count, onClick, jetpack, siteId, hideText, query } ) {
	return (
		<Button
			compact borderless
			className="drafts-button"
			onClick={ onClick }
			disabled={ ! count && ! jetpack }
			aria-label={ translate( 'View all drafts' ) }
		>
			{ siteId && (
				<QueryPosts
					siteId={ siteId }
					query={ query } />
			) }
			{ ! hideText && <span>{ translate( 'Drafts' ) }</span> }
			{ count && ! jetpack ? <Count count={ count } /> : null }
		</Button>
	);
}

EditorDraftsButton.propTypes = {
	count: PropTypes.number,
	onClick: PropTypes.func,
	jetpack: PropTypes.bool,
	siteId: PropTypes.number,
	hideText: PropTypes.bool,
	query: PropTypes.object
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const query = { status: 'draft,pending' };
	const posts = getSitePostsForQuery( state, siteId, query );

	return {
		jetpack: isJetpackSite( state, siteId ),
		count: posts ? posts.length : 0,
		siteId,
		query
	};
} )( EditorDraftsButton );
