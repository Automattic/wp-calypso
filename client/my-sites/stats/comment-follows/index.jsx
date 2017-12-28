/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Followers from '../stats-comment-followers-page';
import HeaderCake from 'client/components/header-cake';
import Main from 'client/components/main';
import StatsFirstView from '../stats-first-view';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { getSiteSlug } from 'client/state/sites/selectors';
import { recordGoogleEvent } from 'client/state/analytics/actions';

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

	paginationHandler = pageNum => {
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
					<HeaderCake onClick={ this.goBack }>{ translate( 'Comments Followers' ) }</HeaderCake>
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
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			slug: getSiteSlug( state, siteId ),
		};
	},
	{ recordGoogleEvent }
);

export default flowRight( connectComponent, localize )( StatsCommentFollows );
