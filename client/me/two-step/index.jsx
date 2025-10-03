import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import AppPasswords from 'calypso/me/application-passwords';
import ReauthRequired from 'calypso/me/reauth-required';
import Security2faBackupCodes from 'calypso/me/security-2fa-backup-codes';
import Security2faDisable from 'calypso/me/security-2fa-disable';
import Security2faKey from 'calypso/me/security-2fa-key';
import Security2faSetup from 'calypso/me/security-2fa-setup';
import SecuritySectionNav from 'calypso/me/security-section-nav';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import isTwoStepEnabled from 'calypso/state/selectors/is-two-step-enabled';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import Security2faEnhancedSecuritySetting from '../security-2fa-enhanced-security-setting';

import './style.scss';

class TwoStep extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	onSetupFinished = () => {
		this.props.fetchUserSettings();
	};

	onDisableFinished = () => {
		this.props.fetchUserSettings();
	};

	componentDidMount() {
		if ( ! this.props.isFetchingUserSettings && ! this.props.isEmailVerified ) {
			page.redirect( '/me/security' );
		}
	}

	componentDidUpdate() {
		if ( ! this.props.isFetchingUserSettings && ! this.props.isEmailVerified ) {
			page.redirect( '/me/security' );
		}
	}

	renderPlaceholders = () => {
		const placeholders = [];

		for ( let i = 0; i < 5; i++ ) {
			placeholders.push(
				<p className="two-step__placeholder-text" key={ '2fa-placeholder' + i }>
					{ ' ' }
					&nbsp;{ ' ' }
				</p>
			);
		}

		return placeholders;
	};

	renderTwoStepSection = () => {
		if ( this.props.isFetchingUserSettings ) {
			return this.renderPlaceholders();
		}

		if ( ! this.props.isTwoStepEnabled ) {
			return <Security2faSetup onFinished={ this.onSetupFinished } />;
		}

		return <Security2faDisable onFinished={ this.onDisableFinished } />;
	};

	renderApplicationPasswords = () => {
		if ( this.props.isFetchingUserSettings || ! this.props.isTwoStepEnabled ) {
			return null;
		}

		return <AppPasswords />;
	};

	render2faKey = () => {
		if ( this.props.isFetchingUserSettings || ! this.props.isTwoStepEnabled ) {
			return null;
		}

		return <Security2faKey />;
	};

	renderBackupCodes = () => {
		if ( this.props.isFetchingUserSettings || ! this.props.isTwoStepEnabled ) {
			return null;
		}

		return <Security2faBackupCodes />;
	};

	renderEnhancedSecuritySetting = () => {
		if (
			! isEnabled( 'two-factor/enhanced-security' ) ||
			this.props.isFetchingUserSettings ||
			! this.props.isTwoStepEnabled
		) {
			return null;
		}
		return <Security2faEnhancedSecuritySetting />;
	};

	render() {
		const { path, translate } = this.props;
		const useCheckupMenu = isEnabled( 'security/security-checkup' );

		return (
			<Main wideLayout className="security two-step">
				<QueryUserSettings />
				<PageViewTracker path="/me/security/two-step" title="Me > Two-Step Authentication" />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<DocumentHead title={ translate( 'Two-Step Authentication' ) } />

				<NavigationHeader navigationItems={ [] } title={ translate( 'Security' ) } />

				{ ! useCheckupMenu && <SecuritySectionNav path={ path } /> }
				{ useCheckupMenu && (
					<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
						{ translate( 'Two-Step Authentication' ) }
					</HeaderCake>
				) }

				{ this.renderTwoStepSection() }
				{ this.renderEnhancedSecuritySetting() }
				{ this.render2faKey() }
				{ this.renderBackupCodes() }
				{ this.renderApplicationPasswords() }
			</Main>
		);
	}
}

export default connect(
	( state ) => ( {
		isFetchingUserSettings: isFetchingUserSettings( state ),
		userSettings: getUserSettings( state ),
		isTwoStepEnabled: isTwoStepEnabled( state ),
		isEmailVerified: isCurrentUserEmailVerified( state ),
	} ),
	{
		fetchUserSettings,
	}
)( localize( TwoStep ) );
