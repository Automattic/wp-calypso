/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Team = require( './team' ),
	SiteUsersFetcher = require( 'components/site-users-fetcher' );

module.exports = React.createClass( {
	displayName: 'TeamList',

	render: function() {
		var fetchOptions = {
			siteId: this.props.site.ID,
			order: 'ASC',
			order_by: 'display_name',
			search: ( this.props.search ) ? '*' + this.props.search + '*' : null,
			search_columns: [ 'display_name', 'user_login' ]
		};

		Object.freeze( fetchOptions );

		return (
			<SiteUsersFetcher fetchOptions={ fetchOptions } >
				<Team { ...this.props } />
			</SiteUsersFetcher>
		);
	}
} );
