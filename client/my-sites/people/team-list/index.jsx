/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Team from './team';
import SiteUsersFetcher from 'components/site-users-fetcher';

/**
 * Module Variables
 */
class TeamList extends Component {
	render() {
		const fetchOptions = {
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
}

export default TeamList;
