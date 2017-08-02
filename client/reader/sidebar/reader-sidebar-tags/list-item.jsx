/**
 * External Dependencies
 */
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import ReaderSidebarHelper from '../helper';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

export class ReaderSidebarTagsListItem extends Component {
	static propTypes = {
		tag: React.PropTypes.object.isRequired,
		onUnfollow: React.PropTypes.func.isRequired,
		path: React.PropTypes.string.isRequired,
		currentTag: React.PropTypes.string,
		translate: React.PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	componentDidMount() {
		// Scroll to the current tag
		if ( this.props.currentTag && this.props.tag.slug === this.props.currentTag ) {
			const node = ReactDom.findDOMNode( this );
			node.scrollIntoView();
		}
	}

	handleTagSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_tag_item' );
		recordGaEvent( 'Clicked Reader Sidebar Tag Item' );
		recordTrack( 'calypso_reader_sidebar_tag_item_clicked', {
			tag: decodeURIComponent( this.props.tag.slug ),
		} );
	};

	render() {
		const { tag, path, onUnfollow, translate } = this.props;
		const tagName = tag.displayName || tag.slug;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<li
				key={ tag.id }
				className={ ReaderSidebarHelper.itemLinkClass( '/tag/' + tag.slug, path, {
					'sidebar-dynamic-menu__tag': true,
				} ) }
			>
				<a
					className="sidebar__menu-item-label"
					href={ tag.url }
					onClick={ this.handleTagSidebarClick }
					title={ translate( "View tag '%(currentTagName)s'", {
						args: {
							currentTagName: tagName,
						},
					} ) }
				>
					<div className="sidebar__menu-item-tagname">
						{ tagName }
					</div>
				</a>
				{ tag.id !== 'pending' &&
					<button
						className="sidebar__menu-action"
						data-tag-slug={ tag.slug }
						onClick={ onUnfollow }
						title={ translate( "Unfollow tag '%(currentTagName)s'", {
							args: {
								currentTagName: tagName,
							},
						} ) }
					>
						<Gridicon icon="cross-small" />
						<span className="sidebar__menu-action-label">
							{ translate( 'Unfollow' ) }
						</span>
					</button> }
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ReaderSidebarTagsListItem );
