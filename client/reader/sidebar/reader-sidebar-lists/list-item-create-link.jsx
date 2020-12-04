/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { recordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';
import ReaderSidebarHelper from '../helper';

export class ReaderSidebarListsListItemCreateLink extends Component {
	handleListSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_list_item_create_link' );
		recordGaEvent( 'Clicked Reader Sidebar List Item Create Link' );
		recordTrack( 'calypso_reader_sidebar_list_item_create_link_clicked' );
	};

	render() {
		const relativePath = '/read/list/new';
		const classes = classNames( 'sidebar__menu-item--create-reader-list-link', {
			selected: ReaderSidebarHelper.pathStartsWithOneOf( [ relativePath ], this.props.path ),
		} );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<li className={ classes }>
				<a
					className="sidebar__menu-link"
					href="/read/list/new"
					onClick={ this.handleListSidebarClick }
				>
					<div className="sidebar__menu-item-title">
						<Gridicon icon="add-outline" />{ ' ' }
						<span className="sidebar__menu-item-title-text">
							{ this.props.translate( 'Create new list' ) }
						</span>
					</div>
				</a>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ReaderSidebarListsListItemCreateLink );
