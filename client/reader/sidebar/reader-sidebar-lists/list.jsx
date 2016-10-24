/**
 * External Dependencies
 */
import React from 'react';
import map from 'lodash/map';

/**
 * Internal Dependencies
 */
import ReaderSidebarListsListItem from './list-item';

const ReaderSidebarListsList = React.createClass( {

	propTypes: {
		lists: React.PropTypes.array,
		path: React.PropTypes.string.isRequired,
		currentListOwner: React.PropTypes.string,
		currentListSlug: React.PropTypes.string
	},

	renderItems() {
		const { currentListOwner, currentListSlug, path } = this.props;
		return map( this.props.lists, function( list ) {
			return (
				<ReaderSidebarListsListItem
					key={ list.ID }
					list={ list }
					path={ path }
					currentListOwner={ currentListOwner }
					currentListSlug={ currentListSlug } />
			);
		} );
	},

	render: function() {
		if ( ! this.props.lists || this.props.lists.length === 0 ) {
			return (
				<li key="empty" className="sidebar__menu-empty">{ this.translate( 'Collect sites together by adding a\xa0list.' ) }</li>
			);
		}

		return (
			<div>{ this.renderItems() }</div>
		);
	}
} );

export default ReaderSidebarListsList;
