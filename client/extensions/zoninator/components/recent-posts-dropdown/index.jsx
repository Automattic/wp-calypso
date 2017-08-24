/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, flowRight, toArray } from 'lodash';

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

class RecentPostsDropdown extends PureComponent {
	static propTypes = {
		ignored: PropTypes.array,
		onSelect: PropTypes.func.isRequired,
		recentPosts: PropTypes.array,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	}

	static defaultProps = {
		recentPosts: [],
		ignored: [],
	}

	handleSelect = option => {
		const { onSelect, recentPosts } = this.props;
		const slug = option.value;

		onSelect( find( recentPosts, { slug } ) );
	}

	render() {
		const { ignored, recentPosts, siteId, translate } = this.props;

		const className = 'zoninator__recent-posts-dropdown';

		// getSitePostsForQuery can return null, hence the need to ensure recentPosts is an array.
		const options = toArray( recentPosts )
			.filter( ( { slug } ) => ! find( ignored, { slug } ) )
			.map( ( { slug, title } ) => ( { label: title, value: slug } ) );

		return (
			<div className={ className }>
				<QueryPosts siteId={ siteId } query={ recentPostsQuery } />

				<SelectDropdown
					compact
					selectedText={ translate( 'Recent posts' ) }
					options={ options }
					onSelect={ this.handleSelect } />
			</div>
		);
	}
}

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		recentPosts: getSitePostsForQuery( state, siteId, recentPostsQuery ),
	};
} );

export default flowRight(
	connectComponent,
	localize,
)( RecentPostsDropdown );
