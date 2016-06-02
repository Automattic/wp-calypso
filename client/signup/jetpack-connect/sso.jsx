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
import CompactCard from 'components/card/compact';
import Gravatar from 'components/gravatar';
import Button from 'components/button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { validateSSONonce, authorizeSSO } from 'state/jetpack-connect/actions';
import addQueryArgs from 'lib/route/add-query-args';
import config from 'config';
import EmptyContent from 'components/empty-content';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Site from 'my-sites/site';
import SitePlaceholder from 'my-sites/site/placeholder';
import { decodeEntities } from 'lib/formatting';
import Gridicon from 'components/gridicon';
import LoggedOutFormFooter from 'components/logged-out-form/footer';

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
		this.maybeValidateSSO( nextProps );

		if ( nextProps.ssoUrl && ! this.props.ssoUrl ) {
			// After receiving the SSO URL, which will log the user in on remote site,
			// we redirect user to remote site to be logged in.
			//
			// Note: We add `calypso_env` so that when we are redirected back to Calypso,
			// we land in the same development environment.
			let configEnv = config( 'env_id' ) || process.env.NODE_ENV;
			const redirect = addQueryArgs( { calypso_env: configEnv }, nextProps.ssoUrl );
			debug( 'Redirecting to: ' + redirect );
			window.location.href = redirect;
		}
	},

	onApproveSSO( event ) {
		event.preventDefault();

		const { siteId, ssoNonce } = this.props;
		debug( 'Approving sso' );
		this.props.authorizeSSO( siteId, ssoNonce );
	},

	onCancelClick( event ) {
		debug( 'Clicked return to site link' );
		this.returnToSiteFallback( event );
	},

	onTryAgainClick( event ) {
		debug( 'Clicked try again link' );
		this.returnToSiteFallback( event );
	},

	onClickSharedDetailsModal( event ) {
		event.preventDefault();
	},

	returnToSiteFallback( event ) {
		// If, for some reason, the API request failed and we do not have the admin URL,
		// then fallback to the user's last location.
		if ( ! get( this.props, 'blogDetails.admin_url' ) ) {
			event.preventDefault();
			window.history.back();
		}
	},

	isButtonDisabled() {
		const { nonceValid, isAuthorizing, isValidating, ssoUrl, authorizationError } = this.props;
		return !! ( ! nonceValid || isAuthorizing || isValidating || ssoUrl || authorizationError );
	},

	getSignInLink() {
		const loginUrl = config( 'login_url' ) || 'https://wordpress.com/wp-login.php';
		return addQueryArgs( { redirect_to: window.location.href }, loginUrl );
	},

	maybeValidateSSO( props = this.props ) {
		const { ssoNonce, siteId, nonceValid, isAuthorizing, isValidating } = props;

		if ( ssoNonce && siteId && 'undefined' === typeof nonceValid && ! isAuthorizing && ! isValidating ) {
			this.props.validateSSONonce( siteId, ssoNonce );
		}
	},

	maybeRenderErrorNotice() {
		const { authorizationError, nonceValid } = this.props;

		if ( ! authorizationError && false !== nonceValid ) {
			return null;
		}

		return (
			<Notice
				status="is-error"
				text={ this.translate( 'Oops, something went wrong.' ) }
				showDismiss={ false }>
				<NoticeAction
					href={ get( this.props, 'blogDetails.admin_url', '#' ) }
					onClick={ this.onTryAgainClick }>
					{ this.translate( 'Try again' ) }
				</NoticeAction>
			</Notice>
		);
	},

	renderSiteCard() {
		const { blogDetails } = this.props;
		let site = <SitePlaceholder />;

		if ( blogDetails ) {
			const siteObject = {
				ID: null,
				url: get( this.props, 'blogDetails.URL', '' ),
				admin_url: get( this.props, 'blogDetails.admin_url', '' ),
				domain: get( this.props, 'blogDetails.domain', '' ),
				icon: get( this.props, 'blogDetails.icon', { img: '', ico: '' } ),
				is_vip: false,
				title: decodeEntities( get( this.props, 'blogDetails.title', '' ) )
			};
			site = <Site site={ siteObject } />;
		}

		return (
			<CompactCard className="jetpack-connect__site">
				{ site }
			</CompactCard>
		);
	},

	renderBadPathArgsError() {
		return (
			<Main>
				<EmptyContent
					illustration="/calypso/images/drake/drake-whoops.svg"
					title={ this.translate(
						'Oops, this URL should not be accessed directly'
					) }
					line={ this.translate(
						'Please click the {{em}}Log in with WordPress.com button{{/em}} on your Jetpack site.',
						{
							components: {
								em: <em />
							}
						}
					) }
					action={ this.translate( 'Read Single Sign-On Documentation' ) }
					actionURL="https://jetpack.com/support/sso/"
				/>
			</Main>
		);
	},

	render() {
		const user = this.props.userModule.get();
		const { ssoNonce, siteId, validationError } = this.props;

		if ( ! ssoNonce || ! siteId || validationError ) {
			return this.renderBadPathArgsError();
		}

		return (
			<Main className="jetpack-connect">
				<div className="jetpack-connect__sso">
					<ConnectHeader
						showLogo={ false }
						headerText={ this.translate( 'Connect with WordPress.com' ) }
						subHeaderText={ this.translate(
							'To use Single Sign-On, WordPress.com needs to be able to connect to your account on %(siteName)s.', {
								args: {
									siteName: get( this.props, 'blogDetails.title' )
								}
							}
						) }
					/>

					{ this.renderSiteCard() }

					<Card>
						{ this.maybeRenderErrorNotice() }
						<div className="jetpack-connect__sso__user-profile">
							<Gravatar user={ user } size={ 120 } imgSize={ 400 } />
							<h3 className="jetpack-connect__sso__log-in-as">
								{ this.translate(
									'Log in as {{strong}}%s{{/strong}}',
									{
										args: user.display_name,
										components: {
											strong: <strong className="jetpack-connect__sso__display-name"/>
										}
									}
								) }
							</h3>
							<div className="jetpack-connect__sso__user-email">
								{ user.email }
							</div>
						</div>

						<LoggedOutFormFooter className="jetpack-connect__sso__actions">
							<p className="jetpack-connect__tos-link">
								{ this.translate( 'By logging in you agree to share {{detailsLink}}details{{/detailsLink}} between WordPress.com and %(siteName)s', {
									components: {
										detailsLink: (
											<a
												href="#"
												onClick={ this.onClickSharedDetailsModal }
												className="jetpack-connect__sso__actions__modal-link"
											/>
										)
									},
									args: {
										siteName: get( this.props, 'blogDetails.title' )
									}
								} ) }
							</p>

							<Button
								primary
								onClick={ this.onApproveSSO }
								disabled={ this.isButtonDisabled() }>
								{ this.translate( 'Log in' ) }
							</Button>
						</LoggedOutFormFooter>
					</Card>

					<LoggedOutFormLinks>
						<LoggedOutFormLinkItem href={ this.getSignInLink() }>
							{ this.translate( 'Sign in as a different user' ) }
						</LoggedOutFormLinkItem>
						<LoggedOutFormLinkItem
							rel="external"
							href={ get( this.props, 'blogDetails.admin_url', '#' ) }
							onClick={ this.onCancelClick }>
							<Gridicon icon="arrow-left" size={ 18 } />
							{ this.translate( 'Return to %(siteName)s', {
								args: {
									siteName: get( this.props, 'blogDetails.title' )
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
			ssoUrl: get( jetpackSSO, 'ssoUrl' ),
			isAuthorizing: get( jetpackSSO, 'isAuthorizing' ),
			isValidating: get( jetpackSSO, 'isValidating' ),
			nonceValid: get( jetpackSSO, 'nonceValid' ),
			authorizationError: get( jetpackSSO, 'authorizationError' ),
			validationError: get( jetpackSSO, 'validationError' ),
			blogDetails: get( jetpackSSO, 'blogDetails' )
		};
	},
	dispatch => bindActionCreators( { authorizeSSO, validateSSONonce }, dispatch )
)( JetpackSSOForm );
