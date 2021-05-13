/**
 * External dependencies
 */
import { map } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from '@automattic/calypso-config';
import ListItem from './list-item';
import ListItemCreateLink from './list-item-create-link';

export class ReaderSidebarListsList extends React.Component {
	static propTypes = {
		lists: PropTypes.array,
		path: PropTypes.string.isRequired,
		currentListOwner: PropTypes.string,
		currentListSlug: PropTypes.string,
		translate: PropTypes.func,
	};

	renderItems() {
		const { currentListOwner, currentListSlug, path } = this.props;
		return map( this.props.lists, ( list ) => {
			return (
				<ListItem
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
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<ul className="sidebar__menu-list">
				{ this.renderItems() }
				{ isEnabled( 'reader/list-management' ) && (
					<ListItemCreateLink key="create-item-link" path={ this.props.path } />
				) }
			</ul>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default ReaderSidebarListsList;
