/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import ExpandableSidebarMenu from '../expandable';
import ReaderSidebarListsList from './list';
import ReaderListsActions from 'lib/reader-lists/actions';

const stats = require( 'reader/stats' );

const ReaderSidebarLists = React.createClass( {

	propTypes: {
		lists: React.PropTypes.array,
		path: React.PropTypes.string.isRequired,
		isOpen: React.PropTypes.bool,
		onClick: React.PropTypes.func,
		currentListOwner: React.PropTypes.string,
		currentListSlug: React.PropTypes.string
	},

	createList( list ) {
		stats.recordAction( 'add_list' );
		stats.recordGaEvent( 'Clicked Create List' );
		stats.recordTrack( 'calypso_reader_create_list_clicked' );
		ReaderListsActions.create( list );
	},

	handleAddClick() {
		stats.recordAction( 'add_list_open_input' );
		stats.recordGaEvent( 'Clicked Add List to Open Input' );
		stats.recordTrack( 'calypso_reader_add_list_clicked' );
	},

	render() {
		const listCount = this.props.lists ? this.props.lists.length : 0;
		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isOpen }
				title={ this.translate( 'Lists' ) }
				count={ listCount }
				addLabel={ this.translate( 'New list name' ) }
				addPlaceholder={ this.translate( 'Give your list a name' ) }
				onAddClick={ this.handleAddClick }
				onAddSubmit={ this.createList }
				onClick={ this.props.onClick }>
					<ReaderSidebarListsList { ...this.props } />
			</ExpandableSidebarMenu>
		);
	}
} );

export default ReaderSidebarLists;
