import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isEligibleForUnseen } from 'calypso/reader/get-helpers';
import { isFollowingOpen } from 'calypso/state/reader-ui/sidebar/selectors';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
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
		};
	}

	static defaultProps = {
		sitesPerPage: 25,
	};

	static propTypes = {
		path: PropTypes.string.isRequired,
		sites: PropTypes.array,
		isWPForTeamsItem: PropTypes.bool,
		hasOrganization: PropTypes.bool,
		isFollowingOpen: PropTypes.bool,
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

	renderSites = ( sites ) => {
		const { path } = this.props;
		return map(
			sites,
			( site ) =>
				site && (
					<ReaderListFollowingItem
						key={ site.ID }
						path={ path }
						site={ site }
						isUnseen={ this.isUnseen() }
					/>
				)
		);
	};

	render() {
		const { sites, sitesPerPage, translate } = this.props;
		const { sitePage } = this.state;
		const allSitesLoaded = sitesPerPage * sitePage >= sites.length;
		const sitesToShow = sites.slice( 0, sitesPerPage * sitePage );

		if ( ! sitesToShow ) {
			return null;
		}

		return (
			<>
				<h2>{ translate( 'Following' ) }</h2>
				<ul>
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
				</ul>
			</>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			isWPForTeamsItem:
				isSiteWPForTeams( state, ownProps.site && ownProps.site.ID ) ||
				isFeedWPForTeams( state, ownProps.feed && ownProps.feed.feed_ID ),
			hasOrganization: hasReaderFollowOrganization(
				state,
				ownProps.feed && ownProps.feed.feed_ID,
				ownProps.site && ownProps.site.ID
			),
			isFollowingOpen: isFollowingOpen( state, ownProps.path ),
			sites: getReaderFollowedSites( state ),
		};
	},
	{
		recordReaderTracksEvent,
	}
)( localize( ReaderListFollowedSites ) );
