/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity, map } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { isEnabled } from 'calypso/config';
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

	static defaultProps = {
		translate: identity,
	};

	renderItems() {
		const { currentListOwner, currentListSlug, path } = this.props;
		return map( this.props.lists, function ( list ) {
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
		const { translate, lists } = this.props;
		if ( ! lists || lists.length === 0 ) {
			return (
				<div key="empty" className="sidebar__menu-empty">
					{ translate( 'Collect sites together by adding a list.' ) }
				</div>
			);
		}

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

export default localize( ReaderSidebarListsList );
