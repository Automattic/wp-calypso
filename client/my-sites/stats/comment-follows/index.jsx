/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Followers from '../stats-comment-followers-page';
import StatsFirstView from '../stats-first-view';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import { recordGoogleEvent } from 'state/analytics/actions';
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class StatsCommentFollows extends Component {
	static propTypes = {
		followList: PropTypes.object,
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
		const { followList, perPage, translate } = this.props;

		return (
			<Main wideLayout={ true }>
				<StatsFirstView />

				<div id="my-stats-content" className="follows-detail follows-detail-comment">
					<HeaderCake onClick={ this.goBack }>
						{ translate( 'Comments Followers' ) }
					</HeaderCake>
					<Followers
						path="comment-follow-summary"
						followList={ followList }
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
			slug: getSiteSlug( state, siteId )
		};
	},
	{ recordGoogleEvent }
);

export default flowRight(
	connectComponent,
	localize
)( StatsCommentFollows );
