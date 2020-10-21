/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import SiteUsersFetcher from 'calypso/components/site-users-fetcher';
import Team from './team';

class TeamList extends React.Component {
	static displayName = 'TeamList';

	render() {
		const fetchOptions = {
			siteId: this.props.site && this.props.site.ID,
			order: 'ASC',
			order_by: 'display_name',
			search: this.props.search ? '*' + this.props.search + '*' : null,
			search_columns: [ 'display_name', 'user_login' ],
		};

		Object.freeze( fetchOptions );

		return (
			<SiteUsersFetcher fetchOptions={ fetchOptions }>
				<Team { ...this.props } />
			</SiteUsersFetcher>
		);
	}
}

export default localize( TeamList );
