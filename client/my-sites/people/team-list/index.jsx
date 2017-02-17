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
		const { search, site } = this.props;

		const fetchOptions = {
			siteId: site.ID,
			order: 'ASC',
			order_by: 'display_name',
			search: search ? '*' + search + '*' : null,
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
