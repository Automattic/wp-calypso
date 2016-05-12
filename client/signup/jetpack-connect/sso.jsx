/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugModule from 'debug';
import get from 'lodash/get';

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
import { validateSSONonce, authorizeSSO } from 'state/jetpack-connect/actions';
import addQueryArgs from 'lib/route/add-query-args';
import config from 'config';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:jetpack-connect:sso' );

const JetpackSSOForm = React.createClass( {
	displayName: 'JetpackSSOForm',

	mixins: [ observe( 'userModule' ) ],

	componentWillMount() {
		this.maybeValidateSSO();
	},

	componentWillReceiveProps( nextProps ) {
		this.maybeValidateSSO();

		if ( nextProps.ssoUrl && ! this.props.ssoUrl ) {
			const redirect = addQueryArgs( { calypso_env: config( 'env' ) }, nextProps.ssoUrl );
			debug( 'Redirecting to: ' + redirect );
			window.location.href = addQueryArgs( { calypso_env: config( 'env' ) }, nextProps.ssoUrl );
		}
	},

	onApproveSSO( event ) {
		event.preventDefault();

		const { siteId, ssoNonce } = this.props;
		debug( 'Approving sso' );
		this.props.authorizeSSO( siteId, ssoNonce );
	},

	onCancelClick( event ) {
		event.preventDefault();
		debug( 'Clicked return to site link' );
		this.props.errorNotice( 'Jetpack SSO is currently in development.' );
	},

	isButtonDisabled() {
		const { nonceValid, isAuthorizing, isValidating, ssoUrl } = this.props;
		return ! nonceValid || !! isAuthorizing || !! isValidating || !! ssoUrl;
	},

	maybeValidateSSO() {
		const { ssoNonce, siteId, nonceValid, isAuthorizing, isValidating } = this.props;

		if ( ! nonceValid && ! isAuthorizing && ! isValidating ) {
			this.props.validateSSONonce( siteId, ssoNonce );
		}
	},

	render() {
		const user = this.props.userModule.get();
		console.log( this.props );

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
								disabled={ this.isButtonDisabled() }>
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
	state => {
		const { jetpackSSO } = state.jetpackConnect;
		return {
			siteId: get( jetpackSSO, 'site_id' ),
			ssoNonce: get( jetpackSSO, 'sso_nonce' ),
			ssoUrl: get( jetpackSSO, 'ssoUrl' ),
			isAuthorizing: get( jetpackSSO, 'isAuthorizing' ),
			isValidating: get( jetpackSSO, 'isValidating' ),
			nonceValid: get( jetpackSSO, 'nonceValid' ),
			authorizationError: get( jetpackSSO, 'authorizationError' ),
			validationError: get( jetpackSSO, 'validationError' ),
		};
	},
	dispatch => bindActionCreators( { errorNotice, authorizeSSO, validateSSONonce }, dispatch )
)( JetpackSSOForm );
