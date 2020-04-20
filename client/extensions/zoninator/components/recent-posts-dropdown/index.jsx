/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, flowRight, map } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import SelectDropdown from 'components/select-dropdown';
import { getPostsForQuery } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const recentPostsQuery = {
	status: 'publish,future',
	number: 10,
};

class RecentPostsDropdown extends PureComponent {
	static propTypes = {
		exclude: PropTypes.array,
		onSelect: PropTypes.func.isRequired,
		posts: PropTypes.array,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	static defaultProps = {
		posts: [],
		exclude: [],
	};

	handleSelect = ( option ) => {
		const { onSelect, posts } = this.props;
		const slug = option.value;

		onSelect( find( posts, { slug } ) );
	};

	render() {
		const { exclude, posts, siteId, translate } = this.props;
		const options = map( posts, ( { slug, title } ) => ( { label: title, value: slug } ) );

		const className = 'zoninator__recent-posts-dropdown';

		return (
			<div className={ className }>
				<QueryPosts siteId={ siteId } query={ { ...recentPostsQuery, exclude } } />

				<SelectDropdown
					compact
					selectedText={ translate( 'Recent posts' ) }
					options={ options }
					onSelect={ this.handleSelect }
				/>
			</div>
		);
	}
}

const connectComponent = connect( ( state, { exclude } ) => {
	const siteId = getSelectedSiteId( state );

	return {
		posts: getPostsForQuery( state, siteId, { ...recentPostsQuery, exclude } ) || [],
		siteId,
	};
} );

export default flowRight( connectComponent, localize )( RecentPostsDropdown );
