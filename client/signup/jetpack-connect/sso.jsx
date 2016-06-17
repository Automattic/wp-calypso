/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugModule from 'debug';
import get from 'lodash/get';
import map from 'lodash/map';

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
import Dialog from 'components/dialog';
import analytics from 'lib/analytics';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:jetpack-connect:sso' );

const JetpackSSOForm = React.createClass( {
	displayName: 'JetpackSSOForm',

	mixins: [ observe( 'userModule' ) ],

	getInitialState() {
		return {
			showTermsDialog: false
		};
	},

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
		analytics.tracks.recordEvent( 'calypso_jetpack_sso_log_in_button_click' );

		const { siteId, ssoNonce } = this.props;
		debug( 'Approving sso' );
		this.props.authorizeSSO( siteId, ssoNonce );
	},

	onCancelClick( event ) {
		debug( 'Clicked return to site link' );
		analytics.tracks.recordEvent( 'calypso_jetpack_sso_return_to_site_link_click' );
		this.returnToSiteFallback( event );
	},

	onTryAgainClick( event ) {
		debug( 'Clicked try again link' );
		analytics.tracks.recordEvent( 'calypso_jetpack_sso_try_again_link_click' );
		this.returnToSiteFallback( event );
	},

	onClickSignInDifferentUser() {
		analytics.tracks.recordEvent( 'calypso_jetpack_sso_sign_in_different_user_link_click' );
	},

	onClickSharedDetailsModal( event ) {
		event.preventDefault();
		analytics.tracks.recordEvent( 'calypso_jetpack_sso_shared_details_link_click' );
		this.setState( {
			showTermsDialog: true
		} );
	},

	closeTermsDialog() {
		this.setState( {
			showTermsDialog: false
		} );
	},

	returnToSiteFallback( event ) {
		// If, for some reason, the API request failed and we do not have the admin URL,
		// then fallback to the user's last location.
		if ( ! get( this.props, 'blogDetails.admin_url' ) ) {
			analytics.tracks.recordEvent( 'calypso_jetpack_sso_admin_url_fallback_redirect' );
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

	getSharedDetailLabel( key ) {
		switch ( key ) {
			case 'ID':
				key = this.translate( 'User ID', { context: 'User Field' } );
				break;
			case 'login':
				key = this.translate( 'Login', { context: 'User Field' } );
				break;
			case 'email':
				key = this.translate( 'Email', { context: 'User Field' } );
				break;
			case 'url':
				key = this.translate( 'URL', { context: 'User Field' } );
				break;
			case 'first_name':
				key = this.translate( 'First Name', { context: 'User Field' } );
				break;
			case 'last_name':
				key = this.translate( 'Last Name', { context: 'User Field' } );
				break;
			case 'display_name':
				key = this.translate( 'Display Name', { context: 'User Field' } );
				break;
			case 'description':
				key = this.translate( 'Description', { context: 'User Field' } );
				break;
			case 'two_step_enabled':
				key = this.translate( 'Two-Step Authentication', { context: 'User Field' } );
				break;
			case 'external_user_id':
				key = this.translate( 'External User ID', { context: 'User Field' } );
				break;
		}

		return key;
	},

	getSharedDetailValue( key, value ) {
		if ( 'two_step_enabled' === key && value !== '' ) {
			value = ( true === value )
				? this.translate( 'Enabled' )
				: this.translate( 'Disabled' );
		}

		return decodeEntities( value );
	},

	getReturnToSiteText() {
		const text = (
			<span className="jetpack-connect__sso__return-to-site">
				<Gridicon icon="arrow-left" size={ 18 } />
				{
					this.translate( 'Return to %(siteName)s', {
						args: {
							siteName: get( this.props, 'blogDetails.title' )
						}
					} )
				}
			</span>
		);

		return this.maybeWrapWithPlaceholder( text );
	},

	getTOSText() {
		const text = this.translate(
			'By logging in you agree to {{detailsLink}}share details{{/detailsLink}} between WordPress.com and %(siteName)s.',
			{
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
			}
		);

		return this.maybeWrapWithPlaceholder( text );
	},

	getSubHeaderText() {
		const text = this.translate(
			'To use Single Sign-On, WordPress.com needs to be able to connect to your account on %(siteName)s.', {
				args: {
					siteName: get( this.props, 'blogDetails.title' )
				}
			}
		);
		return this.maybeWrapWithPlaceholder( text );
	},

	maybeWrapWithPlaceholder( input ) {
		const title = get( this.props, 'blogDetails.title' );
		if ( title ) {
			return input;
		}

		return (
			<span className="jetpack-connect__sso__placeholder">
				{ input }
			</span>
		);
	},

	renderSharedDetailsList() {
		const expectedSharedDetails = {
			ID: '',
			login: '',
			email: '',
			url: '',
			first_name: '',
			last_name: '',
			display_name: '',
			description: '',
			two_step_enabled: '',
			external_user_id: '',
		};
		const sharedDetails = this.props.sharedDetails || expectedSharedDetails;

		return (
			<table className="jetpack-connect__sso__shared-details-table">
				<tbody>
					{ map( sharedDetails, ( value, key ) => {
						return (
							<tr key={ key } className="jetpack-connect__sso__shared-detail-row">
								<td className="jetpack-connect__sso__shared-detail-label">
									{ this.getSharedDetailLabel( key ) }
								</td>
								<td className="jetpack-connect__sso__shared-detail-value">
									{ this.getSharedDetailValue( key, value ) }
								</td>
							</tr>
						);
					} ) }
				</tbody>
			</table>
		);
	},

	renderSharedDetailsDialog() {
		const buttons = [
			{
				action: 'close',
				label: this.translate( 'Got it', { context: 'Used in a button. Similar phrase would be, "I understand".' } )
			}
		];

		return (
			<Dialog
				buttons={ buttons }
				onClose={ this.closeTermsDialog }
				isVisible={ this.state.showTermsDialog }
				className="jetpack-connect_sso_terms-dialog">
				<div className="jetpack-connect_sso_terms-dialog-content">
					<p className="jetpack-connect__sso_shared-details-intro">
						{
							this.translate(
								'When you approve logging in with WordPress.com, we will send the following details to your site.'
							)
						}
					</p>

					{ this.renderSharedDetailsList() }
				</div>
			</Dialog>
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
						subHeaderText={ this.getSubHeaderText() }
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
								{ this.getTOSText() }
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
						<LoggedOutFormLinkItem href={ this.getSignInLink() } onClick={ this.onClickSignInDifferentUser }>
							{ this.translate( 'Sign in as a different user' ) }
						</LoggedOutFormLinkItem>
						<LoggedOutFormLinkItem
							rel="external"
							href={ get( this.props, 'blogDetails.admin_url', '#' ) }
							onClick={ this.onCancelClick }>
							{ this.getReturnToSiteText() }
						</LoggedOutFormLinkItem>
					</LoggedOutFormLinks>
				</div>

				{ this.renderSharedDetailsDialog() }
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
			blogDetails: get( jetpackSSO, 'blogDetails' ),
			sharedDetails: get( jetpackSSO, 'sharedDetails' )
		};
	},
	dispatch => bindActionCreators( { authorizeSSO, validateSSONonce }, dispatch )
)( JetpackSSOForm );
