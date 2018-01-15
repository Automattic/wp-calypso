/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PeopleSectionNav from 'my-sites/people/people-section-nav';

class PeopleInvites extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	render() {
		const { site } = this.props;

		return (
			<Main className="people-invites">
				<SidebarNavigation />

				<div>
					<PeopleSectionNav filter="invites" site={ site } />
				</div>
			</Main>
		);
	}
}

export default localize( PeopleInvites );
