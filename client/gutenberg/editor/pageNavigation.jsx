/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { getPostsForQuery } from 'state/posts/selectors';
import SelectDropdown from 'components/select-dropdown';
import Gridicon from 'components/gridicon';

import getEditorUrl from 'state/selectors/get-editor-url';

/**
 * Style dependencies
 */
import './style.scss';

class PageNavigation extends React.Component {
	navigateToPage( event, destination ) {
		if ( destination ) {
			page( destination );
		}
		if ( this.state.destination ) {
			page( this.state.destination );
		}
		this.setState( { visible: false } );
	}

	changeDestination( event ) {
		this.setState( { destination: event.target.value } );
	}

	pageList() {
		const pages = [];
		let title = '';
		this.props.pages.forEach( currentPage => {
			if ( currentPage.ID === this.props.postId ) {
				title = currentPage.title;
			}
			if ( currentPage.content !== '' ) {
				// filtering out the synthetic pages
				pages.push(
					<SelectDropdown.Item
						key={ currentPage.ID }
						path={ currentPage.editorURL }
						selected={ currentPage.ID === this.props.postId }
					>
						{ currentPage.title }
					</SelectDropdown.Item>
				);
			}
		} );
		pages.push(
			<SelectDropdown.Item
				path={ this.props.newPageLink }
				key="newpage"
				icon={ <Gridicon icon="plus" size={ 18 } /> }
			>
				New Page
			</SelectDropdown.Item>
		);

		return (
			<div>
				<SelectDropdown selectedText={ title } className="pageNavigation__page">
					{ pages }
				</SelectDropdown>
			</div>
		);
	}

	render() {
		const siteId = this.props.siteId;
		const query = {
			page: 0,
			number: 8,
			search: '',
			status: 'publish',
			type: 'page',
		};
		return (
			<div>
				<QueryPosts siteId={ siteId } query={ query } />
				<div className="pageNavigation">{ this.pageList() }</div>
			</div>
		);
	}
}

const mapState = ( state, { query, siteId } ) => {
	const pages = getPostsForQuery( state, siteId, query ) || [];
	return {
		pages: pages.map( currentPage => {
			currentPage.editorURL = getEditorUrl( state, siteId, page.ID, 'page' );
			return currentPage;
		} ),
		newPageLink: getEditorUrl( state, siteId, null, 'page' ),
	};
};

export default flowRight( connect( mapState ), localize )( PageNavigation );
