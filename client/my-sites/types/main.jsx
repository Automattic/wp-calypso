/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import DocumentHead from 'calypso/components/data/document-head';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import PostTypeFilter from 'calypso/my-sites/post-type-filter';
import PostTypeList from 'calypso/my-sites/post-type-list';
import PostTypeUnsupported from './post-type-unsupported';
import PostTypeForbidden from './post-type-forbidden';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getPostType, isPostTypeSupported } from 'calypso/state/post-types/selectors';
import QueryPostTypes from 'calypso/components/data/query-post-types';

function Types( {
	siteId,
	query,
	postType,
	postTypeSupported,
	userCanEdit,
	statusSlug,
	showPublishedStatus,
	translate,
} ) {
	let subHeaderText = '';
	if ( 'Testimonials' === get( postType, 'label', '' ) ) {
		subHeaderText = translate( 'Create and manage all the testimonials on your site.' );
	} else if ( 'Projects' === get( postType, 'label', '' ) ) {
		subHeaderText = translate( 'Create, edit, and manage the portfolio projects on your site.' );
	}

	return (
		<Main wideLayout>
			<DocumentHead title={ get( postType, 'label', '' ) } />
			<PageViewTracker path={ siteId ? '/types/:site' : '/types' } title="Custom Post Type" />
			<SidebarNavigation />
			<FormattedHeader
				brandFont
				className="types__page-heading"
				headerText={ get( postType, 'label', '' ) }
				subHeaderText={ subHeaderText }
				align="left"
			/>
			{ userCanEdit &&
				postTypeSupported && [
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
			{ ! postTypeSupported && <PostTypeUnsupported type={ query.type } /> }
			{ ! userCanEdit && <PostTypeForbidden /> }
			{ siteId && <QueryPostTypes siteId={ siteId } /> }
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
} )( localize( Types ) );
