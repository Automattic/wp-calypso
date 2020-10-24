/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import '../style.scss';
/**
 * Internal dependencies
 */
import ReaderSidebarHelper from '../helper';
import { recordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';

export class ReaderSidebarTagsListItem extends Component {
	static propTypes = {
		tag: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
		currentTag: PropTypes.string,
		translate: PropTypes.func,
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
		const { tag, path, translate } = this.props;
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
					className="sidebar__menu-link"
					href={ tag.url }
					onClick={ this.handleTagSidebarClick }
					title={ translate( "View tag '%(currentTagName)s'", {
						args: {
							currentTagName: tagName,
						},
					} ) }
				>
					<div className="sidebar__menu-item-tagname">{ tagName }</div>
				</a>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ReaderSidebarTagsListItem );
