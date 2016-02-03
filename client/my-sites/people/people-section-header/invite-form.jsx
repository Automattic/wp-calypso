/**
 * External Dependencies
 */
import React from 'react';
import Debug from 'debug';
import LinkedStateMixin from 'react-addons-linked-state-mixin';

/**
 * Internal Dependencies
 */
import RoleSelect from 'my-sites/people/role-select';
import TokenField from 'components/token-field';
import Button from 'components/button';

/**
 * Module Variable
 */
const debug = new Debug( 'calypso:people-section-header:invite-form' );

export default React.createClass( {
	displayName: 'InviteForm',
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
		debug( 'Sending invites', this.state );
	},

	render() {
		return (
			<div className="invite-form">
				<div className="invite-form__fieldset">
					<TokenField
						value={ this.state.usernamesOrEmails }
						onChange={ this.onTokensChange }
						placeHolder={ this.translate( 'Username or Email' ) } />
				</div>
				<div className="invite-form__fieldset">
					<RoleSelect
						id="role"
						name="role"
						key="role"
						siteId={ this.props.site.ID }
						valueLink={ this.linkState( 'role' ) }
						disabled={ this.state.sendingInvites }
						hideLabel={ true }
						appendRoles={ { role: {}, follower: {} } } />
					<Button
						compact
						primary
						onClick={ this.submitForm }
						className="invite-form__submit"
						disabled={ this.state.sendingInvites }>
							{ this.translate( 'Invite' ) }
					</Button>
				</div>
			</div>
		);
	}
} );
