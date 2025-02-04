import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Followers from '../stats-comment-followers-page';
import PageViewTracker from '../stats-page-view-tracker';

class StatsCommentFollows extends Component {
	static propTypes = {
		page: PropTypes.number,
		perPage: PropTypes.number,
		slug: PropTypes.string,
		translate: PropTypes.func,
	};

	goBack = () => {
		page( '/stats/insights/' + this.props.slug );
	};

	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	paginationHandler = ( pageNum ) => {
		let path = '/stats/follows/comment/';
		if ( pageNum > 1 ) {
			path += pageNum + '/';
		}
		path += this.props.slug;
		this.props.recordGoogleEvent( 'Stats', 'Used Pagination on Followers Page', pageNum );
		page( path );
	};

	render() {
		const { perPage, translate } = this.props;

		return (
			<Main wideLayout>
				<PageViewTracker
					path="/stats/follows/comment/:site_id"
					title="Stats > Followers > Comment"
				/>

				<div id="my-stats-content">
					<HeaderCake onClick={ this.goBack }>{ translate( 'Comments Subscribers' ) }</HeaderCake>
					<Followers
						path="comment-follow-summary"
						page={ this.props.page }
						perPage={ perPage }
						pageClick={ this.paginationHandler }
					/>
				</div>
			</Main>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			slug: getSiteSlug( state, siteId ),
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsCommentFollows );
