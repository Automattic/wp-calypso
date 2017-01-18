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

export class ReaderSidebarTagsListItem extends Component {

	static propTypes = {
		tag: React.PropTypes.object.isRequired,
		onUnfollow: React.PropTypes.func.isRequired,
		path: React.PropTypes.string.isRequired,
		currentTag: React.PropTypes.string,
		translate: React.PropTypes.func,
	}

	static defaultProps = {
		translate: identity,
	}

	componentDidMount() {
		// Scroll to the current tag
		if ( this.props.currentTag && this.props.tag.slug === this.props.currentTag ) {
			const node = ReactDom.findDOMNode( this );
			node.scrollIntoView();
		}
	}

	render() {
		const { tag, path, onUnfollow, translate } = this.props;

		return (
			<li key={ tag.ID } className={ ReaderSidebarHelper.itemLinkClass( '/tag/' + tag.slug, path, { 'sidebar-dynamic-menu__tag': true } ) }>
				<a className="sidebar__menu-item-label" href={ tag.URL }>
					<div className="sidebar__menu-item-tagname">{ tag.display_name || tag.slug }</div>
				</a>
				{ tag.ID !== 'pending' ? <button className="sidebar__menu-action" data-tag-slug={ tag.slug } onClick={ onUnfollow }>
					<Gridicon icon="cross-small" />
					<span className="sidebar__menu-action-label">{ translate( 'Unfollow' ) }</span>
				</button> : null }
			</li>
		);
	}
}

export default localize( ReaderSidebarTagsListItem );

