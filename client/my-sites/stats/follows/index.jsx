/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import Followers from '../stats-followers-page';
import HeaderCake from 'components/header-cake';
import analytics from 'lib/analytics';
import Main from 'components/main';
import StatsFirstView from '../stats-first-view';

export default React.createClass( {
	displayName: 'StatsFollows',

	mixins: [ observe( 'sites', 'site', 'followersList' ) ],

	propTypes: {
		followType: PropTypes.string,
		followList: PropTypes.object,
		follwersList: PropTypes.object,
		page: PropTypes.number,
		perPage: PropTypes.number,
		sites: PropTypes.object
	},

	goBack() {
		const site = this.props.sites.getSelectedSite();
		page( '/stats/insights/' + site.slug );
	},

	componentDidMount() {
		window.scrollTo( 0, 0 );
	},

	paginationHandler( pageNum ) {
		const site = this.props.sites.getSelectedSite();
		let path = '/stats/follows/' + this.props.followType + '/';
		if ( pageNum > 1 ) {
			path += pageNum + '/';
		}
		path += site.slug;
		analytics.ga.recordEvent( 'Stats', 'Used Pagination on Followers Page', pageNum );
		page( path );
	},

	changeFilter( selection ) {
		const site = this.props.sites.getSelectedSite();
		const filter = selection.value;

		page( '/stats/follows/' + filter + '/' + site.slug );
	},

	render() {
		const { followType, followersList, followList, perPage, sites } = this.props;
		const site = sites.getSelectedSite();

		return (
			<Main>
				<StatsFirstView />

				<div id="my-stats-content" className={ 'follows-detail follows-detail-' + followType }>
					<HeaderCake onClick={ this.goBack }>
						{ this.translate( 'Followers' ) }
					</HeaderCake>
					<Followers
						path={ followType + '-follow-summary' }
						site={ site }
						followersList={ followersList }
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
} );
