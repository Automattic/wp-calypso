import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Count from 'calypso/components/count';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import SidebarItem from 'calypso/layout/sidebar/item';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import ReaderSidebarHelper from 'calypso/reader/sidebar/helper';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { toggleReaderSidebarFollowing } from 'calypso/state/reader-ui/sidebar/actions';
import { isFollowingOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import getReaderFollowedSites from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import ReaderSidebarFollowingItem from './item';
import '../style.scss';

export class ReaderSidebarFollowedSites extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			sitePage: 1,
		};
	}

	static defaultProps = {
		sitesPerPage: 50,
	};

	static propTypes = {
		path: PropTypes.string.isRequired,
		sites: PropTypes.array,
		isWPForTeamsItem: PropTypes.bool,
		teams: PropTypes.array,
		isFollowingOpen: PropTypes.bool,
		sitesPerPage: PropTypes.number,
	};

	handleReaderSidebarFollowedSitesClicked = () => {
		recordAction( 'clicked_reader_sidebar_followed_sites' );
		recordGaEvent( 'Clicked Reader Sidebar Followed Sites' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_followed_sites_clicked' );
	};

	isUnseen = () => {
		const { teams, isWPForTeamsItem } = this.props;
		return isEligibleForUnseen( { teams, isWPForTeamsItem } );
	};

	renderAll() {
		const { path, translate, sites } = this.props;
		const sum = sites.reduce( ( acc, { unseen_count } ) => acc + ( unseen_count | 0 ), 0 );

		return (
			<SidebarItem
				className={ ReaderSidebarHelper.itemLinkClass( '/read', path, {
					'sidebar-streams__following': true,
				} ) }
				label={ translate( 'All' ) }
				onNavigate={ this.handleReaderSidebarFollowedSitesClicked }
				link="/read"
			>
				{ this.isUnseen() && sum > 0 && <Count count={ sum } compact /> }
			</SidebarItem>
		);
	}

	loadMoreSites = () => {
		const { sitePage } = this.state;
		const { sites, sitesPerPage } = this.props;

		//If we've reached the end of the set of sites, all sites have loaded
		if ( sitesPerPage * sitePage >= sites.length ) {
			return;
		}

		this.setState( {
			sitePage: this.state.sitePage + 1,
		} );
	};

	renderSites = ( sites ) => {
		const { path } = this.props;
		return map(
			sites,
			( site ) =>
				site && (
					<ReaderSidebarFollowingItem
						key={ site.ID }
						path={ path }
						site={ site }
						isUnseen={ this.isUnseen() }
					/>
				)
		);
	};

	render() {
		const { path, translate, sites, sitesPerPage } = this.props;
		const { sitePage } = this.state;
		const allSitesLoaded = sitesPerPage * sitePage >= sites.length;
		const sitesToShow = sites.slice( 0, sitesPerPage * sitePage );

		if ( ! sitesToShow ) {
			return null;
		}

		return (
			<ExpandableSidebarMenu
				expanded={ this.props.isFollowingOpen }
				title={ translate( 'Followed Sites' ) }
				onClick={ this.props.toggleReaderSidebarFollowing }
				materialIcon="check_circle"
				disableFlyout={ true }
				className={
					( '/read' === path ||
						sites.some(
							( site ) =>
								`/read/feeds/${ site.feed_ID }` === path || `/read/blogs/${ site.blog_ID }` === path
						) ) &&
					'sidebar__menu--selected'
				}
			>
				{ this.renderAll() }
				{ this.renderSites( sitesToShow ) }
				{ ! allSitesLoaded && (
					<Button
						plain
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						className="sidebar-streams__following-load-more"
						onClick={ this.loadMoreSites }
					>
						{ translate( 'Load more sites' ) }
					</Button>
				) }
			</ExpandableSidebarMenu>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			isWPForTeamsItem:
				isSiteWPForTeams( state, ownProps.site && ownProps.site.ID ) ||
				isFeedWPForTeams( state, ownProps.feed && ownProps.feed.feed_ID ),
			teams: getReaderTeams( state ),
			isFollowingOpen: isFollowingOpen( state, ownProps.path ),
			sites: getReaderFollowedSites( state ),
		};
	},
	{
		recordReaderTracksEvent,
		toggleReaderSidebarFollowing,
	}
)( localize( ReaderSidebarFollowedSites ) );
