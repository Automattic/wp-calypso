/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { last } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import ReaderSidebarHelper from '../helper';
import { recordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';

export class ReaderSidebarListsListItem extends Component {
	static propTypes = {
		list: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
		currentListOwner: PropTypes.string,
		currentListSlug: PropTypes.string,
	};

	componentDidMount() {
		// Scroll to the current list
		if (
			this.props.list.slug === this.props.currentListSlug &&
			this.props.list.owner === this.props.currentListOwner
		) {
			const node = ReactDom.findDOMNode( this );
			node.scrollIntoView();
		}
	}

	handleListSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_list_item' );
		recordGaEvent( 'Clicked Reader Sidebar List Item' );
		recordTrack( 'calypso_reader_sidebar_list_item_clicked', {
			list: decodeURIComponent( this.props.list.slug ),
		} );
	};

	render() {
		const { list, translate } = this.props;
		const listRelativeUrl = `/read/list/${ list.owner }/${ list.slug }`;
		const listManagementUrls = [
			listRelativeUrl + '/tags',
			listRelativeUrl + '/edit',
			listRelativeUrl + '/sites',
		];

		const lastPathSegment = last( this.props.path.split( '/' ) );
		const isCurrentList =
			lastPathSegment &&
			lastPathSegment.toLowerCase() === list.slug.toLowerCase() &&
			ReaderSidebarHelper.pathStartsWithOneOf( [ listRelativeUrl ], this.props.path );
		const isActionButtonSelected = ReaderSidebarHelper.pathStartsWithOneOf(
			listManagementUrls,
			this.props.path
		);

		const classes = classNames( {
			selected: isCurrentList || isActionButtonSelected,
		} );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<li className={ classes } key={ list.ID }>
				<a
					className="sidebar__menu-link"
					href={ listRelativeUrl }
					onClick={ this.handleListSidebarClick }
					title={ translate( "View list '%(currentListName)s'", {
						args: {
							currentListName: list.title,
						},
					} ) }
				>
					<div className="sidebar__menu-item-listname">{ list.title }</div>
				</a>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ReaderSidebarListsListItem );
