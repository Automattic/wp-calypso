/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { identity, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import ReaderSidebarListsListItem from './list-item';

export class ReaderSidebarListsList extends React.Component {
	static propTypes = {
		lists: PropTypes.array,
		path: PropTypes.string.isRequired,
		currentListOwner: PropTypes.string,
		currentListSlug: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	renderItems() {
		const { currentListOwner, currentListSlug, path } = this.props;
		return map( this.props.lists, function( list ) {
			return (
				<ReaderSidebarListsListItem
					key={ list.ID }
					list={ list }
					path={ path }
					currentListOwner={ currentListOwner }
					currentListSlug={ currentListSlug }
				/>
			);
		} );
	}

	render() {
		const { translate, lists } = this.props;
		if ( ! lists || lists.length === 0 ) {
			return (
				<li key="empty" className="sidebar__menu-empty">
					{ translate( 'Collect sites together by adding a list.' ) }
				</li>
			);
		}

		return (
			<div>
				{ this.renderItems() }
			</div>
		);
	}
}

export default localize( ReaderSidebarListsList );
