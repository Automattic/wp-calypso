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
import PostTypeUnsupported from './post-type-unsupported';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostType, isPostTypeSupported } from 'state/post-types/selectors';

function Types( { query, postType, postTypeSupported } ) {
	return (
		<Main>
			<DocumentHead title={ get( postType, 'label' ) } />
			{ false !== postTypeSupported && [
				<PostTypeFilter key="filter" query={ query } />,
				<PostTypeList key="list" query={ query } />
			] }
			{ false === postTypeSupported && (
				<PostTypeUnsupported type={ query.type } />
			) }
		</Main>
	);
}

Types.propTypes = {
	query: PropTypes.object
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );

	return {
		postTypeSupported: isPostTypeSupported( state, siteId, ownProps.query.type ),
		postType: getPostType( state, siteId, ownProps.query.type )
	};
} )( Types );
