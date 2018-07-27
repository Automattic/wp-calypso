/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { pull, union } from 'lodash';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import getActivityLogFilter from 'state/selectors/get-activity-log-filter';
import Gridicon from 'gridicons';
import { updateFilter } from 'state/activity-log/actions';

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
	onGroupClick = event => {
		const { filter, siteId } = this.props;
		const currentState = event.target.getAttribute( 'class' );
		const group = event.target.getAttribute( 'data-group' );
		event.preventDefault;

		if ( 'included' === currentState ) {
			this.props.updateFilter(
				siteId,
				Object.assign(
					{},
					filter,
					filter.group.length > 1 ? { group: pull( filter.group, group ) } : { group: null },
					filter.notGroup
						? { notGroup: union( filter.notGroup, [ group ] ) }
						: { notGroup: [ group ] }
				)
			);
			return;
		}

		if ( 'excluded' === currentState ) {
			this.props.updateFilter(
				siteId,
				Object.assign(
					{},
					filter,
					filter.notGroup.length > 1
						? { notGroup: pull( filter.notGroup, group ) }
						: { notGroup: null }
				)
			);
			return;
		}

		this.props.updateFilter(
			siteId,
			Object.assign(
				{},
				filter,
				filter.group ? { group: union( filter.group, [ group ] ) } : { group: [ group ] }
			)
		);
	};

	render() {
		const { filter } = this.props;
		return (
			<div className="activity-log-search__filters-groups">
				{ groups.map( group => (
					<button
						data-group={ group.slug }
						onClick={ this.onGroupClick }
						className={ classNames( {
							included: filter.group && filter.group.includes( group.slug ),
							excluded: filter.notGroup && filter.notGroup.includes( group.slug ),
						} ) }
						key={ group.slug }
					>
						<Gridicon
							icon={ group.icon }
							className="activity-log-search__filter-group-icon"
							size={ 18 }
						/>
						<span>{ group.title }</span>
					</button>
				) ) }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			filter: getActivityLogFilter( state, ownProps.siteId ),
		};
	},
	{ updateFilter }
)( localize( ActivityLogSearchGroups ) );
