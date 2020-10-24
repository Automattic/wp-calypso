/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AppleIcon from 'calypso/components/social-icons/apple';
import { CompactCard } from '@automattic/components';
import config from 'calypso/config';
import DocumentHead from 'calypso/components/data/document-head';
import { getRequestError } from 'calypso/state/login/selectors';
import GoogleIcon from 'calypso/components/social-icons/google';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import Notice from 'calypso/components/notice';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import ReauthRequired from 'calypso/me/reauth-required';
import SecuritySectionNav from 'calypso/me/security-section-nav';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import SocialLoginService from './service';
import FormattedHeader from 'calypso/components/formatted-header';

/**
 * Style dependencies
 */
import './style.scss';

class SocialLogin extends Component {
	static displayName = 'SocialLogin';

	static propTypes = {
		errorUpdatingSocialConnection: PropTypes.object,
		path: PropTypes.string,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	renderContent() {
		const { translate, errorUpdatingSocialConnection, path } = this.props;

		const redirectUri = typeof window !== 'undefined' ? window.location.origin + path : null;

		return (
			<div>
				{ errorUpdatingSocialConnection && (
					<Notice status={ 'is-error' } showDismiss={ false }>
						{ errorUpdatingSocialConnection.message }
					</Notice>
				) }

				<CompactCard>
					{ translate(
						'You’ll be able to log in faster by linking your WordPress.com account with the following ' +
							'third-party services. We’ll never post without your permission.'
					) }
				</CompactCard>

				<SocialLoginService service="google" icon={ <GoogleIcon /> } />

				{ config.isEnabled( 'sign-in-with-apple' ) && (
					<SocialLoginService
						service="apple"
						icon={ <AppleIcon /> }
						redirectUri={ redirectUri }
						socialServiceResponse={
							this.props.socialService === 'apple' ? this.props.socialServiceResponse : null
						}
					/>
				) }
			</div>
		);
	}

	render() {
		const { path, translate } = this.props;
		const useCheckupMenu = config.isEnabled( 'security/security-checkup' );
		const title = useCheckupMenu ? translate( 'Social Logins' ) : translate( 'Social Login' );

		return (
			<Main className="security social-login is-wide-layout">
				<PageViewTracker path="/me/security/social-login" title="Me > Social Login" />
				<DocumentHead title={ title } />
				<MeSidebarNavigation />

				<FormattedHeader brandFont headerText={ translate( 'Security' ) } align="left" />

				{ ! useCheckupMenu && <SecuritySectionNav path={ path } /> }
				{ useCheckupMenu && (
					<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
						{ title }
					</HeaderCake>
				) }

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				{ this.renderContent() }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	errorUpdatingSocialConnection: getRequestError( state ),
} ) )( localize( SocialLogin ) );
