/**
 * External dependencies
 */

import debugFactory from 'debug';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AccountPassword from 'me/account-password';
import { Card } from '@automattic/components';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import twoStepAuthorization from 'lib/two-step-authorization';
import PageViewTracker from 'lib/analytics/page-view-tracker';

const debug = debugFactory( 'calypso:me:security:password' );

/**
 * Style dependencies
 */
import './style.scss';

class Security extends React.Component {
	static displayName = 'Security';

	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
	}

	render() {
		const { translate } = this.props;

		return (
			<Main className="security">
				<PageViewTracker path="/me/security" title="Me > Password" />
				<DocumentHead title={ translate( 'Password' ) } />
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card className="me-security-settings security__settings">
					<p>
						{ translate(
							'To update your password enter a new one below. ' +
								'Strong passwords have at least six characters, and use upper and lower case letters, numbers, and symbols like ! ” ? $ % ^ & ).'
						) }
					</p>

					<AccountPassword
						accountPasswordData={ this.props.accountPasswordData }
						autocomplete="new-password"
						// Hint to LastPass not to attempt autofill
						data-lpignore="true"
						userSettings={ this.props.userSettings }
					/>
				</Card>
			</Main>
		);
	}
}

export default localize( Security );
