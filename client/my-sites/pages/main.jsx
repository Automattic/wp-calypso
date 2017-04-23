/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import {
	getSelectedSite,
	getSelectedSiteId,
} from 'state/ui/selectors';
import config from 'config';
import notices from 'notices';
import urlSearch from 'lib/url-search';
import Main from 'components/main';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import PageList from './page-list';
import Search from 'components/search';
import SectionNav from 'components/section-nav';
import SidebarNavigation from 'my-sites/sidebar-navigation';

const debug = debugFactory( 'calypso:my-sites:pages:pages' );
const statuses = [ 'published', 'drafts', 'scheduled', 'trashed' ];

class PagesMain extends React.Component {

	static displayName = 'Pages';

	static propTypes = {
		trackScrollPage: React.PropTypes.func.isRequired
	};

	static defaultProps = {
		perPage: 20
	};

	componentWillMount() {
		this._setWarning( this.props.siteId );
	}

	componentDidMount() {
		debug( 'Pages React component mounted.' );
	}

	componentWillUpdate() {
		this._setWarning( this.props.siteId );
	}

	render() {
		const {
			doSearch,
			search,
			translate,
		} = this.props;
		const status = this.props.status || 'published';
		const filterStrings = {
			published: translate( 'Published', { context: 'Filter label for pages list' } ),
			drafts: translate( 'Drafts', { context: 'Filter label for pages list' } ),
			scheduled: translate( 'Scheduled', { context: 'Filter label for pages list' } ),
			trashed: translate( 'Trashed', { context: 'Filter label for pages list' } )
		};
		const searchStrings = {
			published: translate( 'Search Published…', { context: 'Search placeholder for pages list', textOnly: true } ),
			drafts: translate( 'Search Drafts…', { context: 'Search placeholder for pages list', textOnly: true } ),
			scheduled: translate( 'Search Scheduled…', { context: 'Search placeholder for pages list', textOnly: true } ),
			trashed: translate( 'Search Trashed…', { context: 'Search placeholder for pages list', textOnly: true } )
		};
		return (
			<Main classname="pages">
				<SidebarNavigation />
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
				<PageList { ...this.props } />
			</Main>
		);
	}

	getNavItems( filterStrings, currentStatus ) {
		const {
			site,
			siteId,
		} = this.props;
		const sitePart = site && site.slug || siteId;
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
					key={ `page-filter-${ status }` }>
					{ filterStrings[ status ] }
				</NavItem>
			);
		} );
	}

	_setWarning( selectedSite ) {
		const { translate } = this.props;
		if ( selectedSite && selectedSite.jetpack && ! selectedSite.hasMinimumJetpackVersion ) {
			notices.warning(
				translate( 'Jetpack %(version)s is required to take full advantage of all page editing features.', {
					args: { version: config( 'jetpack_min_version' ) }
				} ),
				{ button: translate( 'Update now' ), href: selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade' }
			);
		}
	}
}

const mapState = state => {
	return {
		site: getSelectedSite( state ),
		siteId: getSelectedSiteId( state ),
	};
};

export default connect( mapState )( localize( urlSearch( PagesMain ) ) );
