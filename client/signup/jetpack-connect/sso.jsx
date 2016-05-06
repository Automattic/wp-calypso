/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import get from 'lodash/get';
import url from 'url';
import debugModule from 'debug';

/**
 * Internap dependencies
 */
import config from 'config';
import Main from 'components/main';
import ConnectHeader from './connect-header';
import observe from 'lib/mixins/data-observe';
import Card from 'components/card';
import Gravatar from 'components/gravatar';
import Button from 'components/button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { authorizeSSO, validateSSONonce } from 'state/jetpack-connect/actions';

/*
 * Internal variables
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
			let parsedUrl = url.parse( nextProps.ssoUrl, true );

			// Add calypso_env property
			let query = parsedUrl.query || {};
			query = Object.assign( query, {
				calypso_env: config( 'env' )
			} );

			const updatedUrlObject = Object.assign( parsedUrl, {
				search: false,
				query: query
			} );

			const redirectUrl = url.format( updatedUrlObject );
			debug( 'Redirecting user to SSO URL:' + redirectUrl );
			window.location.href = redirectUrl;
		}
	},

	onApproveSSO() {
		debug( 'approving sso' );
		const { siteId, ssoNonce } = this.props;
		this.props.authorizeSSO( siteId, ssoNonce );
	},

	isButtonDisabled() {
		const { nonceValid, isAuthorizing, isValidating } = this.props;
		return ! nonceValid || !! isAuthorizing || !! isValidating;
	},

	maybeValidateSSO() {
		const { ssoNonce, siteId, nonceValid, isAuthorizing, isValidating } = this.props;

		if ( ! nonceValid && ! isAuthorizing && ! isValidating ) {
			this.props.validateSSONonce( siteId, ssoNonce );
		}
	},

	render() {
		const user = this.props.userModule.get();
		const { ssoNonce, siteId } = this.props;

		if ( ! ssoNonce || ! siteId ) {
			// We need a better failure here.
			return null;
		}

		return (
			<Main className="jetpack-connect">
				<div className="jetpack-connect__sso">
					<ConnectHeader
						headerText="Connect with WordPress.com"
						subHeaderText="To use Single Sign-On, WordPress.com needs to be able to connect to your account on {$site}"
					/>

					<Card>
						<div className="jetpack-connect_sso__user-profile">
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
						<LoggedOutFormLinkItem>
							{ this.translate( 'Cancel and return to site' ) }
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
	dispatch => bindActionCreators( { authorizeSSO, validateSSONonce }, dispatch )
)( JetpackSSOForm );
