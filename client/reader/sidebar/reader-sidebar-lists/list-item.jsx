/**
 * External Dependencies
 */
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import last from 'lodash/last';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import ReaderSidebarHelper from '../helper';

export class ReaderSidebarListsListItem extends Component {

	static propTypes = {
		list: React.PropTypes.object.isRequired,
		path: React.PropTypes.string.isRequired,
		currentListOwner: React.PropTypes.string,
		currentListSlug: React.PropTypes.string
	}

	componentDidMount() {
		// Scroll to the current list
		if ( this.props.list.slug === this.props.currentListSlug && this.props.list.owner === this.props.currentListOwner ) {
			const node = ReactDom.findDOMNode( this );
			node.scrollIntoView();
		}
	}

	render() {
		const list = this.props.list;
		const listRelativeUrl = `/read/list/${ list.owner }/${ list.slug }`;
		const listManagementUrls = [
			listRelativeUrl + '/tags',
			listRelativeUrl + '/edit',
			listRelativeUrl + '/sites',
		];

		const lastPathSegment = last( this.props.path.split( '/' ) );
		const isCurrentList = lastPathSegment && lastPathSegment.toLowerCase() === list.slug.toLowerCase() && ReaderSidebarHelper.pathStartsWithOneOf( [ listRelativeUrl ], this.props.path );
		const isActionButtonSelected = ReaderSidebarHelper.pathStartsWithOneOf( listManagementUrls, this.props.path );

		const classes = classNames(
			{
				selected: isCurrentList || isActionButtonSelected
			}
		);

		return (
			<li className={ classes } key={ list.ID } >
				<a className="sidebar__menu-item-label" href={ listRelativeUrl }>
					<div className="sidebar__menu-item-listname">{ list.title }</div>
				</a>
			</li>
		);
	}
}

export default ReaderSidebarListsListItem;
