/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import SelectDropdown from 'components/select-dropdown';
import { getSitePostsForQuery } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const recentPostsQuery = {
	status: 'publish,future',
	number: 10,
};

const RecentPostsDropdown = ( {
	siteId,
	recentPosts,
	ignored,
	onSelect,
	translate,
} ) => {
	const handleSelect = option => {
		const slug = option.value;

		onSelect( find( recentPosts, { slug } ) );
	};

	const options = recentPosts
		.filter( ( { slug } ) => ! find( ignored, { slug } ) )
		.map( ( { slug, title } ) => ( { label: title, value: slug } ) );

	return (
		<div>
			<QueryPosts siteId={ siteId } query={ recentPostsQuery } />

			<SelectDropdown
				compact
				selectedText={ translate( 'Recent posts' ) }
				options={ options }
				onSelect={ handleSelect } />
		</div>
	);
};

RecentPostsDropdown.PropTypes = {
	onSelect: PropTypes.function,
	recentPosts: PropTypes.array,
	ignored: PropTypes.array,
};

RecentPostsDropdown.defaultProps = {
	recentPosts: [],
	ignored: [],
};

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId: siteId,
		recentPosts: getSitePostsForQuery( state, siteId, recentPostsQuery ),
	};
} );

export default flowRight(
	connectComponent,
	localize,
)( RecentPostsDropdown );
