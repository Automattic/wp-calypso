/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	debug = require( 'debug' )( 'calypso:stats:follows' );

/**
 * Internal dependencies
 */
var observe = require( 'lib/mixins/data-observe' ),
	Followers = require( './module-followers-page.jsx' ),
	HeaderCake = require( 'components/header-cake' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'StatsFollows',

	mixins: [ observe( 'sites', 'site', 'followersList' ) ],

	goBack: function() {
		var pathParts = this.props.path.split( '/' );
		page( '/stats/' + pathParts[ pathParts.length - 1 ] );
	},

	componentDidMount: function() {
		window.scrollTo( 0, 0 );
	},

	paginationHandler: function( pageNum ) {
		var path = '/stats/follows/' + this.props.followType + '/';
		if ( pageNum > 1 ) {
			path += pageNum + '/';
		}
		path += this.props.domain;
		analytics.ga.recordEvent( 'Stats', 'Used Pagination on Followers Page', pageNum );
		page( path );
	},

	changeFilter: function( selection ) {
		var site = this.props.sites.getSelectedSite(),
			filter = selection.value;

		page( '/stats/follows/' + filter + '/' + site.slug );
	},


	render: function() {
		debug( 'Rendering stats follows' );

		var site = this.props.sites.getSelectedSite();

		return (
			<div className="main main-column" role="main">
				<div id="my-stats-content" className={ "follows-detail follows-detail-" + this.props.followType }>

					<HeaderCake onClick={ this.goBack }>
						{ this.translate( 'Followers' ) }
					</HeaderCake>

					<Followers path={ this.props.followType + '-follow-summary' } site={ site } followersList={ this.props.followersList } followType={ this.props.followType } followList={ this.props.followList } page={ this.props.page } perPage={ this.props.perPage } pageClick={ this.paginationHandler } changeFilter={ this.changeFilter } />
				</div>
			</div>
		);
	}

} );