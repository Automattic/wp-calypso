/**
 * External dependencies
 */
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PostTypeForbidden from './post-type-forbidden';
import PostTypeUnsupported from './post-type-unsupported';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PostTypeFilter from 'my-sites/post-type-filter';
import PostTypeList from 'my-sites/post-type-list';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getPostType, isPostTypeSupported } from 'state/post-types/selectors';
import { canCurrentUser } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

function Types( { siteId, query, postType, postTypeSupported, userCanEdit } ) {
	return (
		<Main>
			<DocumentHead title={ get( postType, 'label' ) } />
			<PageViewTracker
				path={ siteId ? '/types/:site' : '/types' }
				title="Custom Post Type"
			/>
			<SidebarNavigation />
			{ false !== userCanEdit && false !== postTypeSupported && [
				<PostTypeFilter
					key="filter"
					query={ userCanEdit ? query : null }
				/>,
				<PostTypeList
					key="list"
					query={ userCanEdit ? query : null }
					largeTitles={ true }
					wrapTitles={ true }
				/>,
			] }
			{ false === postTypeSupported && (
				<PostTypeUnsupported type={ query.type } />
			) }
			{ false === userCanEdit && (
				<PostTypeForbidden />
			) }
		</Main>
	);
}

Types.propTypes = {
	siteId: PropTypes.number,
	query: PropTypes.object,
	postType: PropTypes.object,
	postTypeSupported: PropTypes.bool,
	userCanEdit: PropTypes.bool
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const postType = getPostType( state, siteId, ownProps.query.type );
	const capability = get( postType, [ 'capabilities', 'edit_posts' ], null );

	return {
		siteId,
		postType,
		postTypeSupported: isPostTypeSupported( state, siteId, ownProps.query.type ),
		userCanEdit: canCurrentUser( state, siteId, capability )
	};
} )( Types );
