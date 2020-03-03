/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import titlecase from 'to-title-case';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import DocumentHead from 'components/data/document-head';
import urlSearch from 'lib/url-search';
import Main from 'components/main';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import PageList from './page-list';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

const statuses = [ 'published', 'drafts', 'scheduled', 'trashed' ];

class PagesMain extends React.Component {
	static displayName = 'Pages';

	static propTypes = {
		status: PropTypes.string,
		search: PropTypes.string,
	};

	static defaultProps = {
		perPage: 20,
	};

	getAnalyticsPath() {
		const { status, siteId } = this.props;
		const basePath = '/pages';

		if ( siteId && status ) {
			return `${ basePath }/${ status }/:site`;
		}

		if ( status ) {
			return `${ basePath }/${ status }`;
		}

		if ( siteId ) {
			return `${ basePath }/:site`;
		}

		return basePath;
	}

	getAnalyticsTitle() {
		const { status } = this.props;

		if ( status && status.length ) {
			return `Pages > ${ titlecase( status ) }`;
		}

		return 'Pages > Published';
	}

	render() {
		const { doSearch, siteId, search, status = 'published', translate } = this.props;

		const filterStrings = {
			published: translate( 'Published', { context: 'Filter label for pages list' } ),
			drafts: translate( 'Drafts', { context: 'Filter label for pages list' } ),
			scheduled: translate( 'Scheduled', { context: 'Filter label for pages list' } ),
			trashed: translate( 'Trashed', { context: 'Filter label for pages list' } ),
		};
		const searchStrings = {
			published: translate( 'Search Published…', {
				context: 'Search placeholder for pages list',
				textOnly: true,
			} ),
			drafts: translate( 'Search Drafts…', {
				context: 'Search placeholder for pages list',
				textOnly: true,
			} ),
			scheduled: translate( 'Search Scheduled…', {
				context: 'Search placeholder for pages list',
				textOnly: true,
			} ),
			trashed: translate( 'Search Trashed…', {
				context: 'Search placeholder for pages list',
				textOnly: true,
			} ),
		};
		return (
			<Main wideLayout classname="pages">
				<PageViewTracker path={ this.getAnalyticsPath() } title={ this.getAnalyticsTitle() } />
				<DocumentHead title={ translate( 'Pages' ) } />
				<SidebarNavigation />
				<FormattedHeader
					className="pages__page-heading"
					headerText={ translate( 'Pages' ) }
					align="left"
				/>
				<SectionNav selectedText={ filterStrings[ status ] }>
					<NavTabs label={ translate( 'Status', { context: 'Filter page group label for tabs' } ) }>
						{ this.getNavItems( filterStrings, status ) }
					</NavTabs>
					<Search
						pinned
						fitsContainer
						onSearch={ doSearch }
						initialValue={ search }
						placeholder={ searchStrings[ status ] }
						analyticsGroup="Pages"
						delaySearch={ true }
					/>
				</SectionNav>
				<PageList siteId={ siteId } status={ status } search={ search } />
			</Main>
		);
	}

	getNavItems( filterStrings, currentStatus ) {
		const { site, siteId } = this.props;
		const sitePart = ( site && site.slug ) || siteId;
		const siteFilter = sitePart ? '/' + sitePart : '';

		return statuses.map( function( status ) {
			let path = `/pages${ siteFilter }`;
			if ( status !== 'publish' ) {
				path = `/pages/${ status }${ siteFilter }`;
			}
			return (
				<NavItem
					path={ path }
					selected={ currentStatus === status }
					key={ `page-filter-${ status }` }
				>
					{ filterStrings[ status ] }
				</NavItem>
			);
		} );
	}
}

const mapState = state => ( {
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapState )( localize( urlSearch( PagesMain ) ) );
