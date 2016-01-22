import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

import RoleSelect from 'my-sites/people/role-select';
import TokenField from 'components/token-field';
import FormTextArea from 'components/forms/form-textarea';
import FormButton from 'components/forms/form-button';
import { sendInvites } from 'lib/invites/actions';
import Card from 'components/card';

export default React.createClass( {
	displayName: 'InvitePeople',

	mixins: [ LinkedStateMixin ],

	componentWillReceiveProps() {
		this.setState( this.resetState() );
	},

	getInitialState() {
		return this.resetState();
	},

	resetState() {
		return ( {
			usernamesOrEmails: [],
			role: '',
			message: '',
			response: false,
			sendingInvites: false
		} );
	},

	onTokensChange( tokens ) {
		this.setState( { usernamesOrEmails: tokens } );
	},

	submitForm() {
		this.setState( { sendingInvites: true } );
		sendInvites( this.props.site.ID, this.state.usernamesOrEmails, this.state.role, this.state.message, ( error, data ) => {
			this.setState( {
				sendingInvites: false,
				response: error ? error : data
			} );
		} );
	},

	renderResponse() {
		return (
			<Card>
				<label>Response:</label><br />
				<code>
					<pre>
						{ JSON.stringify( this.state.response ) }
					</pre>
				</code>
			</Card>
		);
	},

	render() {
		if ( this.props.site.jetpack ) {
			return ( <p>Invites not currently available for Jetpack sites.</p> );
		}
		return (
			<div>
				<Card>
					<label>Usernames or Emails</label>
					<TokenField
						value={ this.state.usernamesOrEmails }
						onChange={ this.onTokensChange } />
					<RoleSelect
						id="role"
						name="role"
						key="role"
						siteId={ this.props.site.ID }
						valueLink={ this.linkState( 'role' ) }
						disabled={ this.state.sendingInvites } />
					<label>Message</label>
					<FormTextArea
						name="message"
						valueLink={ this.linkState( 'message' ) }
						disabled={ this.state.sendingInvites }>
					</FormTextArea>
					<FormButton
						onClick={ this.submitForm }
						disabled={ this.state.sendingInvites }>
							Send Invites
					</FormButton>
				</Card>
				{ this.state.response && this.renderResponse() }
			</div>
		);
	}
} );
