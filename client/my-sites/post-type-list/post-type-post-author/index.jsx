/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { getPost } from 'state/posts/selectors';
import { isSingleUserSite } from 'state/sites/selectors';
import { areAllSitesSingleUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

function PostTypePostAuthor( { singleUserSite, isAllSitesModeSelected, allSitesSingleUser, name } ) {
	if ( ! isEnabled( 'posts/post-type-list' ) ||
		! name ||
		( isAllSitesModeSelected && allSitesSingleUser ) ||
		( ! isAllSitesModeSelected && singleUserSite ) ) {
		return null;
	}

	return (
		<div className="post-type-post-author">
			<div className="post-type-post-author__name">
				{ name }
			</div>
		</div>
	);
}

PostTypePostAuthor.propTypes = {
	globalId: PropTypes.string,
	singleUserSite: PropTypes.bool,
	isAllSitesModeSelected: PropTypes.bool,
	allSitesSingleUser: PropTypes.bool,
	name: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );

	let singleUserSite;
	if ( post ) {
		singleUserSite = isSingleUserSite( state, post.site_ID );
	}

	return {
		singleUserSite,
		name: get( post, [ 'author', 'name' ] ),
		isAllSitesModeSelected: getSelectedSiteId( state ) === null,
		allSitesSingleUser: areAllSitesSingleUser( state ),
	};
} )( localize( PostTypePostAuthor ) );
