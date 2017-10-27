import React from 'react';

const Invitation = ({
	role,
	user
}) => (
	<li>
		<p>Role: { role }</p>
		<p>Email: { user.email }</p>
	</li>
);

const InvitationsList = ( {
	invitees
} ) => (
	<ul>
		{ invitees.map( invitee =>
			<Invitation
				key = { invitee.invite_key }
				{ ...invitee }
			/>
		) }
	</ul>
);

export default InvitationsList;
