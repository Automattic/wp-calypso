/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import getConnectedApplications from 'state/selectors/get-connected-applications';
import Main from 'components/main';
import MaterialIcon from 'components/material-icon';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryAccountRecoverySettings from 'components/data/query-account-recovery-settings';
import QueryConnectedApplications from 'components/data/query-connected-applications';
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import twoStepAuthorization from 'lib/two-step-authorization';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
	isAccountRecoveryEmailActionInProgress,
	isAccountRecoveryEmailValidated,
	isAccountRecoveryPhoneActionInProgress,
	isAccountRecoveryPhoneValidated,
} from '../../state/account-recovery/settings/selectors';
import {
	getCurrentUserEmail,
	isCurrentUserEmailVerified,
} from '../../state/current-user/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const SecurityCheckupNavigationItemContents = function ( props ) {
	const { materialIcon, text, description } = props;
	return (
		<React.Fragment>
			<MaterialIcon icon={ materialIcon } className="security-checkup__nav-item-icon" />
			<div>
				<div>{ text }</div>
				<small>{ description }</small>
			</div>
		</React.Fragment>
	);
};

const SecurityCheckupNavigationItem = function ( props ) {
	const { path, onClick, external, materialIcon, text, description } = props;

	return (
		<VerticalNavItem
			path={ path }
			onClick={ onClick }
			external={ external }
			className="security-checkup__nav-item"
		>
			<SecurityCheckupNavigationItemContents
				materialIcon={ materialIcon }
				text={ text }
				description={ description }
			/>
		</VerticalNavItem>
	);
};

class SecurityCheckupComponent extends React.Component {
	static propTypes = {
		accountRecoveryEmail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		accountRecoveryEmailActionInProgress: PropTypes.bool,
		accountRecoveryEmailValidated: PropTypes.bool,
		accountRecoveryPhone: PropTypes.object,
		accountRecoveryPhoneActionInProgress: PropTypes.bool,
		accountRecoveryPhoneValidated: PropTypes.bool,
		path: PropTypes.string,
		primaryEmail: PropTypes.string,
		primaryEmailVerified: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		userSettings: PropTypes.object,
	};

	state = {
		initialized: false,
	};

	componentDidMount() {
		this.props.userSettings.on( 'change', this.onUserSettingsChange );
		this.props.userSettings.fetchSettings();
	}

	componentWillUnmount() {
		this.props.userSettings.off( 'change', this.onUserSettingsChange );
	}

	getOKIcon() {
		return 'check_circle';
	}

	getWarningIcon() {
		return 'info';
	}

	onUserSettingsChange = () => {
		if ( ! this.state.initialized ) {
			this.setState( {
				initialized: true,
			} );
			return;
		}

		this.forceUpdate();
	};

	renderTitleCard() {
		const { translate } = this.props;
		return (
			<Card compact={ true } className="security-checkup__title-card">
				<h2>{ translate( 'Security Checkup' ) }</h2>
				<div className="security-checkup__title-text">
					{ translate(
						'Please review this summary of your account security and recovery settings'
					) }
				</div>
			</Card>
		);
	}

	renderPlaceholderNavItem() {
		return <VerticalNavItem isPlaceholder={ true } />;
	}

	renderConnectedApps() {
		const { connectedApps, translate } = this.props;
		if ( connectedApps === null ) {
			return this.renderPlaceholderNavItem();
		}

		let connectedAppsDescription;
		if ( ! connectedApps.length ) {
			connectedAppsDescription = translate( 'You do not have any connected applications.' );
		} else {
			connectedAppsDescription = translate(
				'You currently have %(numberOfApps)d connected application.',
				'You currently have %(numberOfApps)d connected applications.',
				{
					count: connectedApps.length,
					args: {
						numberOfApps: connectedApps.length,
					},
				}
			);
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/security/connected-applications' }
				materialIcon={ this.getWarningIcon() }
				text={ translate( 'Connected Apps' ) }
				description={ connectedAppsDescription }
			/>
		);
	}

	renderAccountEmail() {
		const { primaryEmail, primaryEmailVerified, translate } = this.props;

		let icon, description;

		if ( ! primaryEmailVerified ) {
			icon = this.getWarningIcon();
			description = translate(
				'Your account email address is set to {{strong}}%(emailAddress)s{{/strong}}, but is not verified yet.',
				{
					args: {
						emailAddress: primaryEmail,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			icon = this.getOKIcon();
			description = translate(
				'Your account email address is set to {{strong}}%(emailAddress)s{{/strong}}.',
				{
					args: {
						emailAddress: primaryEmail,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/account' }
				materialIcon={ icon }
				text={ translate( 'Account Email' ) }
				description={ description }
			/>
		);
	}

	renderRecoveryEmail() {
		const {
			accountRecoveryEmail,
			accountRecoveryEmailActionInProgress,
			accountRecoveryEmailValidated,
			translate,
		} = this.props;

		if ( accountRecoveryEmailActionInProgress ) {
			return this.renderPlaceholderNavItem();
		}

		let icon, description;

		if ( ! accountRecoveryEmail ) {
			icon = this.getWarningIcon();
			description = translate( 'You do not have a recovery email address.' );
		} else if ( ! accountRecoveryEmailValidated ) {
			icon = this.getWarningIcon();
			description = translate(
				'You still need to validate your recovery email address: {{strong}}%(recoveryEmailAddress)s{{/strong}}',
				{
					args: {
						recoveryEmailAddress: accountRecoveryEmail,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			icon = this.getOKIcon();
			description = translate(
				'You have set {{strong}}%(recoveryEmailAddress)s{{/strong}} as your recovery email address.',
				{
					args: {
						recoveryEmailAddress: accountRecoveryEmail,
					},
					components: {
						strong: '<strong>',
					},
				}
			);
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/security/account-recovery' }
				materialIcon={ icon }
				text={ translate( 'Recovery Email' ) }
				description={ description }
			/>
		);
	}

	renderRecoveryPhone() {
		const {
			accountRecoveryPhone,
			accountRecoveryPhoneActionInProgress,
			accountRecoveryPhoneValidated,
			translate,
		} = this.props;

		if ( accountRecoveryPhoneActionInProgress ) {
			return this.renderPlaceholderNavItem();
		}

		let icon, description;

		if ( ! accountRecoveryPhone ) {
			icon = this.getWarningIcon();
			description = translate( 'You do not have a recovery SMS number.' );
		} else if ( ! accountRecoveryPhoneValidated ) {
			icon = this.getWarningIcon();
			description = translate(
				'You still need to validate your recovery SMS number: {{strong}}%(recoveryPhoneNumber)s{{/strong}}',
				{
					args: {
						recoveryPhoneNumber: accountRecoveryPhone.numberFull,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			icon = this.getOKIcon();
			description = translate(
				'You have set {{strong}}%(recoveryPhoneNumber)s{{/strong}} as your recovery SMS number.',
				{
					args: {
						recoveryPhoneNumber: accountRecoveryPhone,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/security/account-recovery' }
				materialIcon={ icon }
				text={ translate( 'Recovery SMS Number' ) }
				description={ description }
			/>
		);
	}

	renderTwoFactorAuthentication() {
		const { translate, userSettings } = this.props;

		if ( ! userSettings.initialized || userSettings.fetchingData ) {
			return this.renderPlaceholderNavItem();
		}

		let icon, description;
		if ( userSettings.settings.two_step_enabled ) {
			icon = this.getOKIcon();
			description = translate(
				'You have two-step authentication {{strong}}enabled{{/strong}} using an app.',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		} else if ( userSettings.settings.two_step_sms_enabled ) {
			icon = this.getOKIcon();
			description = translate(
				'You have two-step authentication {{strong}}enabled{{/strong}} using SMS messages to {{strong}}%(phoneNumber)s{{/strong}}.',
				{
					args: {
						phoneNumber: userSettings.settings.two_step_sms_phone_number,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			icon = this.getWarningIcon();
			description = translate( 'You do not have two-step authentication enabled.' );
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/security/two-step' }
				materialIcon={ icon }
				text={ translate( 'Two-Step Authentication' ) }
				description={ description }
			/>
		);
	}

	renderVerticalNav() {
		return (
			<VerticalNav>
				{ this.renderAccountEmail() }
				{ this.renderTwoFactorAuthentication() }
				{ this.renderRecoveryEmail() }
				{ this.renderRecoveryPhone() }
				{ this.renderConnectedApps() }
			</VerticalNav>
		);
	}

	render() {
		const { path, translate } = this.props;

		return (
			<Main className="security security-checkup">
				<QueryAccountRecoverySettings />
				<QueryConnectedApplications />

				<PageViewTracker path="/me/security/security-checkup" title="Me > Security Checkup" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<MeSidebarNavigation />

				<DocumentHead title={ translate( 'Security Checkup' ) } />

				<SecuritySectionNav path={ path } />

				{ this.renderTitleCard() }
				{ this.renderVerticalNav() }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	accountRecoveryEmail: getAccountRecoveryEmail( state ),
	accountRecoveryEmailActionInProgress: isAccountRecoveryEmailActionInProgress( state ),
	accountRecoveryEmailValidated: isAccountRecoveryEmailValidated( state ),
	accountRecoveryPhone: getAccountRecoveryPhone( state ),
	accountRecoveryPhoneActionInProgress: isAccountRecoveryPhoneActionInProgress( state ),
	accountRecoveryPhoneValidated: isAccountRecoveryPhoneValidated( state ),
	connectedApps: getConnectedApplications( state ),
	primaryEmail: getCurrentUserEmail( state ),
	primaryEmailVerified: isCurrentUserEmailVerified( state ),
} ) )( localize( SecurityCheckupComponent ) );
