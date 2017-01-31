/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import Followers from '../stats-followers-page';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import StatsFirstView from '../stats-first-view';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

class StatsFollows extends Component {
	static propTypes = {
		followType: PropTypes.string,
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
		let path = '/stats/follows/' + this.props.followType + '/';
		if ( pageNum > 1 ) {
			path += pageNum + '/';
		}
		path += this.props.slug;
		this.props.recordGoogleEvent( 'Stats', 'Used Pagination on Followers Page', pageNum );
		page( path );
	};

	changeFilter = ( selection ) => {
		const filter = selection.value;

		page( '/stats/follows/' + filter + '/' + this.props.slug );
	};

	render() {
		const { followType, followList, perPage, translate } = this.props;

		return (
			<Main wideLayout={ true }>
				<StatsFirstView />

				<div id="my-stats-content" className={ 'follows-detail follows-detail-' + followType }>
					<HeaderCake onClick={ this.goBack }>
						{ translate( 'Followers' ) }
					</HeaderCake>
					<Followers
						path={ followType + '-follow-summary' }
						followType={ followType }
						followList={ followList }
						page={ this.props.page }
						perPage={ perPage }
						pageClick={ this.paginationHandler }
						changeFilter={ this.changeFilter } />
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
)( StatsFollows );
