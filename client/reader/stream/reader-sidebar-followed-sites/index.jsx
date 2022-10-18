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
		hasOrganization: PropTypes.bool,
		isFollowingOpen: PropTypes.bool,
		sitesPerPage: PropTypes.number,
	};

	isUnseen = () => {
		const { isWPForTeamsItem, hasOrganization } = this.props;
		return isEligibleForUnseen( { isWPForTeamsItem, hasOrganization } );
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
		const { sites, sitesPerPage } = this.props;
		const { sitePage } = this.state;
		const sitesToShow = sites.slice( 0, sitesPerPage * sitePage );

		if ( ! sitesToShow ) {
			return null;
		}

		return <ul>{ this.renderSites( sitesToShow ) }</ul>;
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
)( localize( ReaderSidebarFollowedSites ) );
