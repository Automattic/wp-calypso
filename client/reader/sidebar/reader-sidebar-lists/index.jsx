/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal Dependencies
 */
import ExpandableSidebarMenu from '../expandable';
import ReaderSidebarListsList from './list';
import ReaderListsActions from 'lib/reader-lists/actions';

import {
	recordAction,
	recordGaEvent,
	recordTrack,
} from 'reader/stats';

export class ReaderSidebarLists extends Component {

	static propTypes = {
		lists: PropTypes.array,
		path: PropTypes.string.isRequired,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		currentListOwner: PropTypes.string,
		currentListSlug: PropTypes.string,
		translate: PropTypes.func,
	}

	static defaultProps = {
		translate: identity,
	}

	createList = ( list ) => {
		recordAction( 'add_list' );
		recordGaEvent( 'Clicked Create List' );
		recordTrack( 'calypso_reader_create_list_clicked' );
		ReaderListsActions.create( list );
	}

	handleAddClick = () => {
		recordAction( 'add_list_open_input' );
		recordGaEvent( 'Clicked Add List to Open Input' );
		recordTrack( 'calypso_reader_add_list_clicked' );
	}

	render() {
		const { translate, lists, count, isOpen, onClick } = this.props;
		const listCount = lists ? lists.length : 0;
		const shouldHideAddButton = ! count;
		return (
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Lists' ) }
				count={ listCount }
				addLabel={ translate( 'New list name' ) }
				addPlaceholder={ translate( 'Give your list a name' ) }
				onAddClick={ this.handleAddClick }
				onAddSubmit={ this.createList }
				onClick={ onClick }
				hideAddButton={ shouldHideAddButton }
			>
					<ReaderSidebarListsList { ...this.props } />
			</ExpandableSidebarMenu>
		);
	}
}

export default localize( ReaderSidebarLists );
