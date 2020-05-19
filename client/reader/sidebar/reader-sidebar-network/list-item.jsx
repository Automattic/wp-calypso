/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import '../style.scss';

/**
 * Internal dependencies
 */
import ReaderSidebarHelper from '../helper';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

export class ReaderSidebarNetworkListItem extends Component {
	static propTypes = {
		hasUnseen: PropTypes.bool,
		path: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	handleSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_network_item' );
		recordGaEvent( 'Clicked Reader Sidebar Network Item' );
		recordTrack( 'calypso_reader_sidebar_network_item_clicked', {
			blog: decodeURIComponent( this.props.blog ),
		} );
	};

	render() {
		const { blog, path, hasUnseen } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<li
				key={ blog.ID }
				className={ ReaderSidebarHelper.itemLinkClass( '/read/blogs/' + blog.ID, path, {
					'sidebar-dynamic-menu__blog': true,
					'has-unseen': hasUnseen,
				} ) }
			>
				<a
					className="sidebar__menu-link"
					href={ `/read/blogs/${ blog.ID }` }
					onClick={ this.handleSidebarClick }
				>
					{ hasUnseen && <span className="sidebar__bubble" /> }
					<div className="sidebar__menu-item-tagname">{ blog.name }</div>
				</a>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ReaderSidebarNetworkListItem );
