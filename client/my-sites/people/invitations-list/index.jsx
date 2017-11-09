import React from 'react';
import { connect } from 'react-redux';

import { requestInvites } from 'state/sites/invites/actions';
import Card from 'components/card';
import Gravatar from 'components/gravatar';


const Invitation = ({
	role,
	user
}) => (
	<div>
		<Gravatar user={ user } size={ 72 } />
		<p>Role: { role }</p>
		<p>Email: { user.email }</p>
	</div>
);


class InvitationsList extends React.Component {
	componentWillMount() {
		this.props.requestInvites( this.props.site.ID );
	}

	render() {
		return (
			<Card>
				{ this.props.invites.map( invitee =>
						<Invitation
							key = { invitee.invite_key }
							{ ...invitee }
						/>
				) }
			</Card>
		);
	}
}

export default connect(
	state => {
		return { invites: state.sites.invites.items }
	},
	{ requestInvites }
)( InvitationsList );
