/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Gridicon from 'components/gridicon';
import ReaderSidebarHelper from '../helper';

const ReaderSidebarTagsListItem = React.createClass( {

	propTypes: {
		tag: React.PropTypes.object.isRequired,
		onUnfollow: React.PropTypes.func.isRequired,
		path: React.PropTypes.string.isRequired,
		currentTag: React.PropTypes.string
	},

	componentDidMount() {
		// Scroll to the current tag
		if ( this.props.currentTag && this.props.tag.slug === this.props.currentTag ) {
			const node = this.getDOMNode();
			node.scrollIntoView();
		}
	},

	render() {
		const tag = this.props.tag;

		return (
			<li key={ tag.ID } className={ ReaderSidebarHelper.itemLinkClass( '/tag/' + tag.slug, this.props.path, { 'sidebar-dynamic-menu__tag': true } ) }>
				<a className="sidebar__menu-item-label" href={ tag.URL }>
					{ tag.title || tag.slug }
				</a>
				{ tag.ID !== 'pending' ? <button className="sidebar__menu-action" data-tag-slug={ tag.slug } onClick={ this.props.onUnfollow }>
					<Gridicon icon="cross-small" />
					<span className="sidebar__menu-action-label">{ this.translate( 'Unfollow' ) }</span>
				</button> : null }
			</li>
		);
	}
} );

export default ReaderSidebarTagsListItem;

