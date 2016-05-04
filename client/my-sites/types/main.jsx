/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PostTypeFilter from 'my-sites/post-type-filter';
import PostTypeList from 'my-sites/post-type-list';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostType } from 'state/post-types/selectors';

function Types( { query, postType } ) {
	return (
		<Main>
			<DocumentHead title={ get( postType, 'label' ) } />
			<PostTypeFilter query={ query } />
			<PostTypeList query={ query } />
		</Main>
	);
}

Types.propTypes = {
	query: PropTypes.object
};

export default connect( ( state, ownProps ) => {
	return {
		postType: getPostType( state, getSelectedSiteId( state ), ownProps.query.type )
	};
} )( Types );
