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
import QueryPostCounts from 'components/data/query-post-counts';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getAllPostCount } from 'state/posts/counts/selectors';

function EditorDraftsButton( { count, onClick, jetpack, siteId, hideText } ) {
	return (
		<Button
			compact borderless
			className="drafts-button"
			onClick={ onClick }
			disabled={ ! count && ! jetpack }
			aria-label={ translate( 'View all drafts' ) }
		>
			{ siteId && (
				<QueryPostCounts siteId={ siteId } type="post" />
			) }
			{ ! hideText && <span>{ translate( 'Drafts' ) }</span> }
			{ count && ! jetpack ? <Count count={ count } /> : null }
		</Button>
	);
};

EditorDraftsButton.propTypes = {
	count: PropTypes.number,
	onClick: PropTypes.func,
	jetpack: PropTypes.bool,
	siteId: PropTypes.number,
	hideText: PropTypes.bool
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		jetpack: isJetpackSite( state, siteId ),
		count: getAllPostCount( state, siteId, 'post', 'draft' ),
		siteId
	};
} )( EditorDraftsButton );
