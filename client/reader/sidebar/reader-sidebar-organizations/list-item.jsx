import { Count } from '@automattic/components';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Favicon from 'calypso/reader/components/favicon';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';

export class ReaderSidebarOrganizationsListItem extends Component {
	static propTypes = {
		site: PropTypes.object,
		path: PropTypes.string,
	};

	handleSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_organization_item' );
		recordGaEvent( 'Clicked Reader Sidebar Organization Item' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_organization_item_clicked', {
			blog: decodeURIComponent( this.props.site ),
		} );
	};

	render() {
		const { site, path, moment } = this.props;
		const computedClassName = ReaderSidebarHelper.itemLinkClass(
			'/reader/feeds/' + site.feed_ID,
			path
		);

		const selected = computedClassName.includes( 'selected' );

		return (
			<MenuItem selected={ selected } key={ this.props.title }>
				<MenuItemLink
					className="sidebar__menu-link-reader"
					href={ `/reader/feeds/${ site.feed_ID }` }
					onClick={ this.handleSidebarClick }
				>
					<Favicon site={ site } className="sidebar__menu-item-siteicon" size={ 18 } />

					<span className="sidebar__menu-item-sitename">
						{ site.name }
						<span className="sidebar__menu-item-last-updated">
							{ site.last_updated > 0 && moment( new Date( site.last_updated ) ).fromNow() }
						</span>
					</span>
					{ site.unseen_count > 0 && <Count count={ site.unseen_count } compact /> }
				</MenuItemLink>
			</MenuItem>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( withLocalizedMoment( ReaderSidebarOrganizationsListItem ) );
