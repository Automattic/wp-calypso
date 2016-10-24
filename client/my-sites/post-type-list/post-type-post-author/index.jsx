/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPost } from 'state/posts/selectors';
import { isSingleUserSite } from 'state/sites/selectors';
import Gridicon from 'components/gridicon';

function PostTypePostAuthor( { translate, singleUserSite, name } ) {
	if ( ! name || singleUserSite ) {
		return null;
	}

	return (
		<div className="post-type-post-author">
			<Gridicon
				icon="user"
				size={ 18 }
				className="post-type-post-author__icon" />
			{ translate( 'by %(name)s', { args: { name } } ) }
		</div>
	);
}

PostTypePostAuthor.propTypes = {
	translate: PropTypes.func,
	globalId: PropTypes.string,
	singleUserSite: PropTypes.bool,
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
		name: get( post, [ 'author', 'name' ] )
	};
} )( localize( PostTypePostAuthor ) );
