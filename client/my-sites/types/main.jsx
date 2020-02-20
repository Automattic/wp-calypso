/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import DocumentHead from 'components/data/document-head';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import PostTypeFilter from 'my-sites/post-type-filter';
import PostTypeList from 'my-sites/post-type-list';
import PostTypeUnsupported from './post-type-unsupported';
import PostTypeForbidden from './post-type-forbidden';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPostType, isPostTypeSupported } from 'state/post-types/selectors';

function Types( {
	siteId,
	query,
	postType,
	postTypeSupported,
	userCanEdit,
	statusSlug,
	showPublishedStatus,
} ) {
	return (
		<Main wideLayout>
			<DocumentHead title={ get( postType, 'label' ) } />
			<PageViewTracker path={ siteId ? '/types/:site' : '/types' } title="Custom Post Type" />
			<SidebarNavigation />
			<FormattedHeader
				className="types__page-heading"
				headerText={ get( postType, 'label' ) }
				align="left"
			/>
			{ false !== userCanEdit &&
				false !== postTypeSupported && [
					<PostTypeFilter
						key="filter"
						query={ userCanEdit ? query : null }
						statusSlug={ statusSlug }
					/>,
					<PostTypeList
						key="list"
						query={ userCanEdit ? query : null }
						showPublishedStatus={ showPublishedStatus }
						scrollContainer={ document.body }
					/>,
				] }
			{ false === postTypeSupported && <PostTypeUnsupported type={ query.type } /> }
			{ false === userCanEdit && <PostTypeForbidden /> }
		</Main>
	);
}

Types.propTypes = {
	siteId: PropTypes.number,
	query: PropTypes.object,
	postType: PropTypes.object,
	postTypeSupported: PropTypes.bool,
	userCanEdit: PropTypes.bool,
	statusSlug: PropTypes.string,
	showPublishedStatus: PropTypes.bool,
};

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	const postType = getPostType( state, siteId, ownProps.query.type );
	const capability = get( postType, [ 'capabilities', 'edit_posts' ], null );

	return {
		siteId,
		postType,
		postTypeSupported: isPostTypeSupported( state, siteId, ownProps.query.type ),
		userCanEdit: canCurrentUser( state, siteId, capability ),
	};
} )( Types );
