/**
 * External dependencies
 */
import debugModule from 'debug';
import Gridicon from 'components/gridicon';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flowRight, get, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/route';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { Button, Card, CompactCard, Dialog } from '@automattic/components';
import config from 'config';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';
import EmptyContent from 'components/empty-content';
import FormattedHeader from 'components/formatted-header';
import Gravatar from 'components/gravatar';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormFooter from 'components/logged-out-form/footer';
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import Main from 'components/main';
import MainWrapper from './main-wrapper';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import { decodeEntities } from 'lib/formatting';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSSO } from 'state/jetpack-connect/selectors';
import { login } from 'lib/paths';
import { persistSsoApproved } from './persistence-utils';
import { validateSSONonce, authorizeSSO } from 'state/jetpack-connect/actions';

/*
 * Module variables
 */
const debug = debugModule( 'calypso:jetpack-connect:sso' );

class JetpackSsoForm extends Component {
	state = {
		showTermsDialog: false,
	};

	UNSAFE_componentWillMount() {
		this.maybeValidateSSO();
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.maybeValidateSSO( nextProps );

		if ( nextProps.ssoUrl && ! this.props.ssoUrl ) {
			// After receiving the SSO URL, which will log the user in on remote site,
			// we redirect user to remote site to be logged in.
			//
			// Note: We add `calypso_env` so that when we are redirected back to Calypso,
			// we land in the same development environment.
			const configEnv = config( 'env_id' ) || process.env.NODE_ENV;
			const redirect = addQueryArgs( { calypso_env: configEnv }, nextProps.ssoUrl );
			debug( 'Redirecting to: ' + redirect );
			window.location.href = redirect;
		}
	}

	onApproveSSO = ( event ) => {
		event.preventDefault();
		recordTracksEvent( 'calypso_jetpack_sso_log_in_button_click' );

		const { siteId, ssoNonce } = this.props;
		const siteUrl = get( this.props, 'blogDetails.URL' );

		persistSsoApproved( siteId );

		debug( 'Approving sso' );
		this.props.authorizeSSO( siteId, ssoNonce, siteUrl );
	};

	onCancelClick = ( event ) => {
		debug( 'Clicked return to site link' );
		recordTracksEvent( 'calypso_jetpack_sso_return_to_site_link_click' );
		this.returnToSiteFallback( event );
	};

	onTryAgainClick = ( event ) => {
		debug( 'Clicked try again link' );
		recordTracksEvent( 'calypso_jetpack_sso_try_again_link_click' );
		this.returnToSiteFallback( event );
	};

	onClickSignInDifferentUser = () => {
		recordTracksEvent( 'calypso_jetpack_sso_sign_in_different_user_link_click' );
	};

	onClickSharedDetailsModal = ( event ) => {
		event.preventDefault();
		recordTracksEvent( 'calypso_jetpack_sso_shared_details_link_click' );
		this.setState( {
			showTermsDialog: true,
		} );
	};

	closeTermsDialog = () => {
		this.setState( {
			showTermsDialog: false,
		} );
	};

	returnToSiteFallback = ( event ) => {
		// If, for some reason, the API request failed and we do not have the admin URL,
		// then fallback to the user's last location.
		if ( ! get( this.props, 'blogDetails.admin_url' ) ) {
			recordTracksEvent( 'calypso_jetpack_sso_admin_url_fallback_redirect' );
			event.preventDefault();
			window.history.back();
		}
	};

	isButtonDisabled() {
		const { currentUser } = this.props;
		const { nonceValid, isAuthorizing, isValidating, ssoUrl, authorizationError } = this.props;
		return !! (
			! nonceValid ||
			isAuthorizing ||
			isValidating ||
			ssoUrl ||
			authorizationError ||
			! currentUser.email_verified
		);
	}

	getSignInLink() {
		return login( { redirectTo: window.location.href } );
	}

	maybeValidateSSO( props = this.props ) {
		const { ssoNonce, siteId, nonceValid, isAuthorizing, isValidating } = props;

		if (
			ssoNonce &&
			siteId &&
			'undefined' === typeof nonceValid &&
			! isAuthorizing &&
			! isValidating
		) {
			this.props.validateSSONonce( siteId, ssoNonce );
		}
	}

	maybeRenderErrorNotice() {
		const { authorizationError, nonceValid, translate } = this.props;

		if ( ! authorizationError && false !== nonceValid ) {
			return null;
		}

		return (
			<Notice
				status="is-error"
				text={ translate( 'Oops, something went wrong.' ) }
				showDismiss={ false }
			>
				<NoticeAction
					href={ get( this.props, 'blogDetails.admin_url', '#' ) }
					onClick={ this.onTryAgainClick }
				>
					{ translate( 'Try again' ) }
				</NoticeAction>
			</Notice>
		);
	}

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
				title: decodeEntities( get( this.props, 'blogDetails.title', '' ) ),
			};
			site = <Site site={ siteObject } />;
		}

		return <CompactCard className="jetpack-connect__site">{ site }</CompactCard>;
	}

	getSharedDetailLabel( key ) {
		const { translate } = this.props;
		switch ( key ) {
			case 'ID':
				key = translate( 'User ID', { context: 'User Field' } );
				break;
			case 'login':
				key = translate( 'Login', { context: 'User Field' } );
				break;
			case 'email':
				key = translate( 'Email', { context: 'User Field' } );
				break;
			case 'url':
				key = translate( 'URL', { context: 'User Field' } );
				break;
			case 'first_name':
				key = translate( 'First Name', { context: 'User Field' } );
				break;
			case 'last_name':
				key = translate( 'Last Name', { context: 'User Field' } );
				break;
			case 'display_name':
				key = translate( 'Display Name', { context: 'User Field' } );
				break;
			case 'description':
				key = translate( 'Description', { context: 'User Field' } );
				break;
			case 'two_step_enabled':
				key = translate( 'Two-Step Authentication', { context: 'User Field' } );
				break;
			case 'external_user_id':
				key = translate( 'External User ID', { context: 'User Field' } );
				break;
		}

		return key;
	}

	getSharedDetailValue( key, value ) {
		const { translate } = this.props;
		if ( 'two_step_enabled' === key && value !== '' ) {
			value = true === value ? translate( 'Enabled' ) : translate( 'Disabled' );
		}

		return decodeEntities( value );
	}

	getReturnToSiteText() {
		const { translate } = this.props;
		const text = (
			<span className="jetpack-connect__sso-return-to-site">
				<Gridicon icon="arrow-left" size={ 18 } />
				{ translate( 'Return to %(siteName)s', {
					args: {
						siteName: get( this.props, 'blogDetails.title' ),
					},
				} ) }
			</span>
		);

		return this.maybeWrapWithPlaceholder( text );
	}

	getTOSText() {
		const { translate } = this.props;
		// translators: "share details" is a link to a legal document.
		// "share details" implies that both WordPress.com and %(siteName) will have access to the user info
		// siteName is the partner's site name (eg. Google)
		const text = translate(
			'By logging in you agree to {{detailsLink}}share details{{/detailsLink}} between WordPress.com and %(siteName)s.',
			{
				components: {
					detailsLink: (
						// eslint-disable-next-line jsx-a11y/anchor-is-valid
						<a
							href="#"
							onClick={ this.onClickSharedDetailsModal }
							className="jetpack-connect__sso-actions-modal-link"
						/>
					),
				},
				args: {
					siteName: get( this.props, 'blogDetails.title' ),
				},
			}
		);

		return this.maybeWrapWithPlaceholder( text );
	}

	getSubHeaderText() {
		const { translate } = this.props;
		// translators: siteName is a partner site name. Eg "Google.com" or "Tumblr.com".
		const text = translate(
			'To use Single Sign-On, WordPress.com needs to be able to connect to your account on %(siteName)s.',
			{
				args: {
					siteName: get( this.props, 'blogDetails.title' ),
				},
			}
		);
		return this.maybeWrapWithPlaceholder( text );
	}

	maybeWrapWithPlaceholder( input ) {
		const title = get( this.props, 'blogDetails.title' );
		if ( title ) {
			return input;
		}

		return <span className="jetpack-connect__sso-placeholder">{ input }</span>;
	}

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
			<table className="jetpack-connect__sso-shared-details-table">
				<tbody>
					{ map( sharedDetails, ( value, key ) => {
						return (
							<tr key={ key } className="jetpack-connect__sso-shared-detail-row">
								<td className="jetpack-connect__sso-shared-detail-label">
									{ this.getSharedDetailLabel( key ) }
								</td>
								<td className="jetpack-connect__sso-shared-detail-value">
									{ this.getSharedDetailValue( key, value ) }
								</td>
							</tr>
						);
					} ) }
				</tbody>
			</table>
		);
	}

	renderSharedDetailsDialog() {
		const { translate } = this.props;
		const buttons = [
			{
				action: 'close',
				label: translate( 'Got it', {
					context: 'Used in a button. Similar phrase would be, "I understand".',
				} ),
			},
		];

		return (
			<Dialog
				buttons={ buttons }
				onClose={ this.closeTermsDialog }
				isVisible={ this.state.showTermsDialog }
				className="jetpack-connect__sso-terms-dialog"
			>
				<div className="jetpack-connect__sso-terms-dialog-content">
					<p className="jetpack-connect__sso-shared-details-intro">
						{ translate(
							'When you approve logging in with WordPress.com, we will send the following details to your site.'
						) }
					</p>

					{ this.renderSharedDetailsList() }
				</div>
			</Dialog>
		);
	}

	renderBadPathArgsError() {
		const { translate } = this.props;
		return (
			<Main>
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ translate( 'Oops, this URL should not be accessed directly' ) }
					line={ translate(
						'Please click the {{em}}Log in with WordPress.com button{{/em}} on your Jetpack site.',
						{
							components: {
								em: <em />,
							},
						}
					) }
					action={ translate( 'Read Single Sign-On Documentation' ) }
					actionURL="https://jetpack.com/support/sso/"
				/>
			</Main>
		);
	}

	render() {
		const { currentUser } = this.props;
		const { ssoNonce, siteId, validationError, translate } = this.props;

		if ( ! ssoNonce || ! siteId || validationError ) {
			return this.renderBadPathArgsError();
		}

		return (
			<MainWrapper>
				<div className="jetpack-connect__sso">
					<FormattedHeader
						headerText={ translate( 'Connect with WordPress.com' ) }
						subHeaderText={ this.getSubHeaderText() }
					/>

					{ this.renderSiteCard() }

					<EmailVerificationGate
						noticeText={ translate( 'You must verify your email to sign in with WordPress.com.' ) }
						noticeStatus="is-info"
					>
						<Card>
							{ currentUser.email_verified && this.maybeRenderErrorNotice() }
							<div className="jetpack-connect__sso-user-profile">
								<Gravatar user={ currentUser } size={ 120 } imgSize={ 400 } />
								<h3 className="jetpack-connect__sso-log-in-as">
									{
										// translators: %s is the user's display name. Eg: Login in as "John Doe"
										translate( 'Log in as {{strong}}%s{{/strong}}', {
											args: currentUser.display_name,
											components: {
												strong: <strong className="jetpack-connect__sso-display-name" />,
											},
										} )
									}
								</h3>
								<div className="jetpack-connect__sso-user-email">{ currentUser.email }</div>
							</div>

							<LoggedOutFormFooter className="jetpack-connect__sso-actions">
								<p className="jetpack-connect__tos-link">{ this.getTOSText() }</p>

								<Button primary onClick={ this.onApproveSSO } disabled={ this.isButtonDisabled() }>
									{ translate( 'Log in' ) }
								</Button>
							</LoggedOutFormFooter>
						</Card>
					</EmailVerificationGate>

					<LoggedOutFormLinks>
						<LoggedOutFormLinkItem
							href={ this.getSignInLink() }
							onClick={ this.onClickSignInDifferentUser }
						>
							{ translate( 'Sign in as a different user' ) }
						</LoggedOutFormLinkItem>
						<LoggedOutFormLinkItem
							rel="external"
							href={ get( this.props, 'blogDetails.admin_url', '#' ) }
							onClick={ this.onCancelClick }
						>
							{ this.getReturnToSiteText() }
						</LoggedOutFormLinkItem>
						<JetpackConnectHappychatButton
							eventName="calypso_jpc_sso_chat_initiated"
							label={ translate( 'Chat with Jetpack support' ) }
						>
							<HelpButton />
						</JetpackConnectHappychatButton>
					</LoggedOutFormLinks>
				</div>

				{ this.renderSharedDetailsDialog() }
			</MainWrapper>
		);
	}
}

const connectComponent = connect(
	( state ) => {
		const jetpackSSO = getSSO( state );
		return {
			ssoUrl: get( jetpackSSO, 'ssoUrl' ),
			isAuthorizing: get( jetpackSSO, 'isAuthorizing' ),
			isValidating: get( jetpackSSO, 'isValidating' ),
			nonceValid: get( jetpackSSO, 'nonceValid' ),
			authorizationError: get( jetpackSSO, 'authorizationError' ),
			validationError: get( jetpackSSO, 'validationError' ),
			blogDetails: get( jetpackSSO, 'blogDetails' ),
			sharedDetails: get( jetpackSSO, 'sharedDetails' ),
			currentUser: getCurrentUser( state ),
		};
	},
	{
		authorizeSSO,
		validateSSONonce,
	}
);

export default flowRight( connectComponent, localize )( JetpackSsoForm );
