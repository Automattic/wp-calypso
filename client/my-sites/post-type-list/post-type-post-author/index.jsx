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
import Gridicon from 'components/gridicon';

function PostTypePostAuthor( { translate, name } ) {
	if ( ! name ) {
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
	name: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	return {
		name: get( getPost( state, ownProps.globalId ), [ 'author', 'name' ] )
	};
} )( localize( PostTypePostAuthor ) );
