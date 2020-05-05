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
import AppleIcon from 'components/social-icons/apple';
import { CompactCard } from '@automattic/components';
import config from 'config';
import DocumentHead from 'components/data/document-head';
import { getRequestError } from 'state/login/selectors';
import GoogleIcon from 'components/social-icons/google';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import Notice from 'components/notice';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import twoStepAuthorization from 'lib/two-step-authorization';
import SocialLoginService from './service';

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
		const title = this.props.translate( 'Social Login' );

		return (
			<Main className="social-login">
				<PageViewTracker path="/me/security/social-login" title="Me > Social Login" />
				<DocumentHead title={ title } />
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				{ this.renderContent() }
			</Main>
		);
	}
}

export default connect( ( state ) => ( {
	errorUpdatingSocialConnection: getRequestError( state ),
} ) )( localize( SocialLogin ) );
