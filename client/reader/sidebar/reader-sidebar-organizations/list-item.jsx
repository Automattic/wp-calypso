import page from '@automattic/calypso-router';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AutoDirection from 'calypso/components/auto-direction';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import ReaderUnreadCount from 'calypso/layout/sidebar/reader-unread-count';
import { MoreMenuActions } from 'calypso/reader/sidebar/more-menu-actions';
import { getReaderSidebarSiteName } from 'calypso/reader/sidebar/reader-sidebar-recent';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';

export class ReaderSidebarOrganizationsListItem extends Component {
	static propTypes = {
		site: PropTypes.object,
		path: PropTypes.string,
		fallbackPath: PropTypes.string,
	};

	handleSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_organization_item' );
		recordGaEvent( 'Clicked Reader Sidebar Organization Item' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_organization_item_clicked', {
			blog: decodeURIComponent( this.props.site ),
		} );
	};

	render() {
		const { site, path, moment, fallbackPath } = this.props;
		const computedClassName = ReaderSidebarHelper.itemLinkClass(
			'/reader/feeds/' + site.feed_ID,
			path
		);

		const selected = computedClassName.includes( 'selected' );
		const feedId = site.feed_ID ? Number( site.feed_ID ) : null;

		return (
			<MenuItem selected={ selected } key={ this.props.title }>
				<MenuItemLink
					className="sidebar__menu-link-reader"
					href={ `/reader/feeds/${ site.feed_ID }` }
					onClick={ this.handleSidebarClick }
				>
					<SiteIcon iconUrl={ site.site_icon } size={ 22 } />

					<span className="sidebar__menu-item-sitename">
						<AutoDirection>
							<span>{ site.name }</span>
						</AutoDirection>
						<span className="sidebar__menu-item-last-updated">
							{ site.last_updated > 0 && moment( new Date( site.last_updated ) ).fromNow() }
						</span>
					</span>
					<span className="sidebar__actions-and-count">
						{ feedId && site.feed_URL && (
							<MoreMenuActions
								identifier={ `feed:${ feedId }` }
								feedIds={ [ feedId ] }
								feedUrls={ [ site.feed_URL ] }
								unseenCount={ site.unseen_count }
								blogId={ site.blog_ID }
								siteName={ getReaderSidebarSiteName( site ) }
								source="reader-organization-item"
								onUnsubscribed={ () => {
									if ( selected && fallbackPath ) {
										page( fallbackPath );
									}
								} }
							/>
						) }
						<ReaderUnreadCount count={ site.unseen_count } />
					</span>
				</MenuItemLink>
			</MenuItem>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( withLocalizedMoment( ReaderSidebarOrganizationsListItem ) );
