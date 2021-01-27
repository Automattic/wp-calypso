/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AppPasswords from 'calypso/me/application-passwords';
import { Card } from '@automattic/components';
import config from 'calypso/config';
import DocumentHead from 'calypso/components/data/document-head';
import { fetchUserSettings } from 'calypso/state/user-settings/actions';
import FormattedHeader from 'calypso/components/formatted-header';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import HeaderCake from 'calypso/components/header-cake';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import isTwoStepEnabled from 'calypso/state/selectors/is-two-step-enabled';
import Main from 'calypso/components/main';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import ReauthRequired from 'calypso/me/reauth-required';
import Security2faBackupCodes from 'calypso/me/security-2fa-backup-codes';
import Security2faDisable from 'calypso/me/security-2fa-disable';
import Security2faKey from 'calypso/me/security-2fa-key';
import Security2faSetup from 'calypso/me/security-2fa-setup';
import SecuritySectionNav from 'calypso/me/security-section-nav';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';

/**
 * Style dependencies
 */
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

	render() {
		const { path, translate } = this.props;
		const useCheckupMenu = config.isEnabled( 'security/security-checkup' );

		return (
			<Main className="security two-step is-wide-layout">
				<QueryUserSettings />
				<PageViewTracker path="/me/security/two-step" title="Me > Two-Step Authentication" />
				<MeSidebarNavigation />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				<DocumentHead title={ translate( 'Two-Step Authentication' ) } />

				<FormattedHeader brandFont headerText={ translate( 'Security' ) } align="left" />

				{ ! useCheckupMenu && <SecuritySectionNav path={ path } /> }
				{ useCheckupMenu && (
					<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
						{ translate( 'Two-Step Authentication' ) }
					</HeaderCake>
				) }

				<Card>{ this.renderTwoStepSection() }</Card>

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
	} ),
	{
		fetchUserSettings,
	}
)( localize( TwoStep ) );
