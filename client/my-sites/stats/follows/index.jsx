/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import observe from 'lib/mixins/data-observe';
import Followers from '../module-followers-page.jsx';
import HeaderCake from 'components/header-cake';
import analytics from 'analytics';

export default React.createClass( {
	displayName: 'StatsFollows',

	mixins: [ observe( 'sites', 'site', 'followersList' ) ],

	propTypes: {
		domain: PropTypes.string,
		followType: PropTypes.string,
		followList: PropTypes.object,
		follwersList: PropTypes.object,
		page: PropTypes.number,
		perPage: PropTypes.number,
		sites: PropTypes.object
	},

	goBack: function() {
		const pathParts = this.props.path.split( '/' );
		page( '/stats/' + pathParts[ pathParts.length - 1 ] );
	},

	componentDidMount: function() {
		window.scrollTo( 0, 0 );
	},

	paginationHandler: function( pageNum ) {
		let path = '/stats/follows/' + this.props.followType + '/';
		if ( pageNum > 1 ) {
			path += pageNum + '/';
		}
		path += this.props.domain;
		analytics.ga.recordEvent( 'Stats', 'Used Pagination on Followers Page', pageNum );
		page( path );
	},

	changeFilter: function( selection ) {
		const site = this.props.sites.getSelectedSite();
		const filter = selection.value;

		page( '/stats/follows/' + filter + '/' + site.slug );
	},

	render: function() {
		const site = this.props.sites.getSelectedSite();

		return (
			<div className="main main-column" role="main">
				<div id="my-stats-content" className={ 'follows-detail follows-detail-' + this.props.followType }>

					<HeaderCake onClick={ this.goBack }>
						{ this.translate( 'Followers' ) }
					</HeaderCake>
					<Followers
						path={ this.props.followType + '-follow-summary' }
						site={ site }
						followersList={ this.props.followersList }
						followType={ this.props.followType }
						followList={ this.props.followList }
						page={ this.props.page }
						perPage={ this.props.perPage }
						pageClick={ this.paginationHandler }
						changeFilter={ this.changeFilter } />
				</div>
			</div>
		);
	}
} );
