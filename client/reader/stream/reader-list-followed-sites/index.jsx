import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import UrlSearch from 'calypso/lib/url-search';
import { filterFollowsByIsFollowed, filterFollowsByQuery } from 'calypso/reader/follow-helpers';
import FollowingManageSearchFollowed from 'calypso/reader/following-manage/search-followed';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import { hasReaderFollowOrganization } from 'calypso/state/reader/follows/selectors';
import getReaderFollowedSites from 'calypso/state/reader/follows/selectors/get-reader-followed-sites';
import isFeedWPForTeams from 'calypso/state/selectors/is-feed-wpforteams';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import ReaderListFollowingItem from './item';
import '../style.scss';

export class ReaderListFollowedSites extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			sitePage: 1,
			query: '',
		};
	}

	static defaultProps = {
		sitesPerPage: 25,
	};

	static propTypes = {
		path: PropTypes.string.isRequired,
		sites: PropTypes.array,
		doSearch: PropTypes.func.isRequired,
		isWPForTeamsItem: PropTypes.bool,
		hasOrganization: PropTypes.bool,
		sitesPerPage: PropTypes.number,
	};

	isUnseen = () => {
		const { isWPForTeamsItem, hasOrganization } = this.props;
		return isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } );
	};

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

	renderSites = ( follows ) => {
		const { path } = this.props;
		return map(
			follows,
			( follow ) =>
				follow && (
					<ReaderListFollowingItem
						key={ follow.ID }
						path={ path }
						follow={ follow }
						isUnseen={ this.isUnseen() }
					/>
				)
		);
	};

	searchEvent = ( query ) => {
		this.setState( {
			query: query,
		} );
		this.props.doSearch( query );
	};

	render() {
		const { sites, sitesPerPage, translate } = this.props;
		const { sitePage, query } = this.state;
		const searchThreshold = 15;
		let filteredFollows = filterFollowsByQuery( query, sites );
		filteredFollows = filterFollowsByIsFollowed( filteredFollows );
		const allSitesLoaded = sitesPerPage * sitePage >= filteredFollows.length;
		const sitesToShow = filteredFollows.slice( 0, sitesPerPage * sitePage );

		if ( ! sitesToShow ) {
			return null;
		}

		return (
			<>
				<h2>
					{ translate( 'Subscriptions' ) }{ ' ' }
					<a href="/read/subscriptions">{ translate( 'Manage' ) }</a>
				</h2>
				{ sites.length >= searchThreshold && (
					<FollowingManageSearchFollowed onSearch={ this.searchEvent } initialValue={ query } />
				) }
				<ul>
					{ this.renderSites( sitesToShow ) }
					{ ! allSitesLoaded && (
						<li className="reader-sidebar-more">
							<Button
								plain
								className="sidebar-streams__following-load-more"
								onClick={ this.loadMoreSites }
							>
								{ translate( 'Load more sites' ) }
							</Button>
						</li>
					) }
				</ul>
			</>
		);
	}
}

export default connect( ( state, ownProps ) => {
	return {
		isWPForTeamsItem:
			isSiteWPForTeams( state, ownProps.site && ownProps.site.ID ) ||
			isFeedWPForTeams( state, ownProps.feed && ownProps.feed.feed_ID ),
		hasOrganization: hasReaderFollowOrganization(
			state,
			ownProps.feed && ownProps.feed.feed_ID,
			ownProps.site && ownProps.site.ID
		),
		sites: getReaderFollowedSites( state ),
	};
} )( localize( UrlSearch( ReaderListFollowedSites ) ) );
