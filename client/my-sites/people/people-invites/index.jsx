/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PeopleSectionNav from 'my-sites/people/people-section-nav';
import Card from 'components/card';
import { getSelectedSiteId } from 'state/ui/selectors';
import { requestInvites } from 'state/invites/actions';

class PeopleInvites extends React.PureComponent {
	static propTypes = {
		site: PropTypes.object.isRequired,
	};

	render() {
		const { site, requesting, invites } = this.props;

		if ( ! site || ! site.ID ) {
			return null;
		}

		return (
			<Main className="people-invites">
				<SidebarNavigation />

				<div>
					<PeopleSectionNav filter="invites" site={ site } />
					{ ! requesting && ! invites && this.props.requestInvites( site.ID ) }
					{ requesting && <Card>Loading invites...</Card> }
					{ ( invites || [] ).map( invite => (
						<Card key={ invite.invite_key } style={ { wordWrap: 'break-word' } }>
							{ JSON.stringify( invite ) }
						</Card>
					) ) }
				</div>
			</Main>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = ownProps.site && ownProps.site.ID;

		return {
			requesting: siteId && state.invites.requesting[ siteId ],
			invites: siteId && state.invites.items[ siteId ],
		};
	},
	{
		requestInvites,
	}
)( localize( PeopleInvites ) );
