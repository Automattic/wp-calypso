/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import ConnectHeader from './connect-header';
import observe from 'lib/mixins/data-observe';
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import Button from 'components/button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { errorNotice } from 'state/notices/actions';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:jetpack-connect:sso' );

const JetpackSSOForm = React.createClass( {
	displayName: 'JetpackSSOForm',

	mixins: [ observe( 'userModule' ) ],

	onApproveSSO( event ) {
		event.preventDefault();
		debug( 'Approving sso' );
		this.props.errorNotice( 'Jetpack SSO is currently in development.' );
	},

	onCancelClick( event ) {
		event.preventDefault();
		debug( 'Clicked return to site link' );
		this.props.errorNotice( 'Jetpack SSO is currently in development.' );
	},

	render() {
		const user = this.props.userModule.get();

		return (
			<Main className="jetpack-connect">
				<div className="jetpack-connect__sso">
					<ConnectHeader
						headerText="Connect with WordPress.com"
						subHeaderText="To use Single Sign-On, WordPress.com needs to be able to connect to your account on {$site}"
					/>

					<Card>
						<div className="jetpack-connect__sso__user-profile">
							<Gravatar user={ user } size={ 120 } imgSize={ 400 } />
							<h3 className="jetpack-connect__sso__user-profile-name">
								{ this.translate(
									'Log in as {{strong}}%s{{/strong}}',
									{
										args: user.display_name,
										components: {
											strong: <strong />
										}
									}
								) }
							</h3>
							<div className="jetpack-connect__sso__user-email">
								{ user.email }
							</div>
						</div>

						<div className="jetpack-connect__sso__actions">
							<Button
								primary
								onClick={ this.onApproveSSO }
								disabled={ false }>
								{ this.translate( 'Log in' ) }
							</Button>
						</div>
					</Card>

					<LoggedOutFormLinks>
						<LoggedOutFormLinkItem onClick={ this.onCancelClick } >
							{ this.translate( 'Return to %(siteName)s', {
								args: {
									siteName: '{$site}'
								}
							} ) }
						</LoggedOutFormLinkItem>
					</LoggedOutFormLinks>
				</div>
			</Main>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { errorNotice }, dispatch )
)( JetpackSSOForm );
