/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ReaderSidebarHelper from '../helper';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import Count from 'components/count';

/**
 * Styles
 */
import '../style.scss';
import Favicon from 'reader/components/favicon';

export class ReaderSidebarOrganizationsListItem extends Component {
	static propTypes = {
		site: PropTypes.object,
		path: PropTypes.string,
	};

	handleSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_organization_item' );
		recordGaEvent( 'Clicked Reader Sidebar Organization Item' );
		recordTrack( 'calypso_reader_sidebar_organization_item_clicked', {
			blog: decodeURIComponent( this.props.site ),
		} );
	};

	render() {
		const { site, path } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<li
				key={ this.props.title }
				className={ ReaderSidebarHelper.itemLinkClass( '/read/feeds/' + site.feed_ID, path, {
					'sidebar-dynamic-menu__blog': true,
				} ) }
			>
				<a
					className="sidebar__menu-link sidebar__menu-link-reader"
					href={ `/read/feeds/${ site.feed_ID }` }
					onClick={ this.handleSidebarClick }
				>
					<Favicon url={ site.URL } className="sidebar__menu-item-siteicon" size={ 18 } />

					<div className="sidebar__menu-item-sitename">{ site.name }</div>
					{ site.unseen_count > 0 && <Count count={ site.unseen_count } compact /> }
				</a>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default ReaderSidebarOrganizationsListItem;
