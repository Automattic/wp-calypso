/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { updateFilter } from 'state/activity-log/actions';
import Gridicon from 'gridicons';

// Note: this data-set will eventually come from the API
const groups = [
	{ slug: 'post', title: 'Posts and Pages', icon: 'posts' },
	{ slug: 'user', title: 'Users', icon: 'user' },
	{ slug: 'comment', title: 'Comments', icon: 'comment' },
	{ slug: 'attachment', title: 'Media and Attachments', icon: 'attachment' },
	{ slug: 'setting', title: 'Settings', icon: 'cog' },
	{ slug: 'term', title: 'Categories and Tags', icon: 'tag' },
];

class ActivityLogSearchGroups extends Component {
	render() {
		return (
			<div className="activity-log-search__filters-groups">
				{ groups.map( group => (
					<button key={ group.slug }>
						<Gridicon
							icon={ group.icon }
							className="activity-log-search__filter-group-icon"
							size={ 18 }
							data-group={ group.slug }
						/>
						<span>{ group.title }</span>
					</button>
				) ) }
			</div>
		);
	}
}

export default connect(
	null,
	{ updateFilter }
)( localize( ActivityLogSearchGroups ) );
