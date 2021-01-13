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
import AccountPassword from 'calypso/me/account-password';
import { Card } from '@automattic/components';
import config from 'calypso/config';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import MeSidebarNavigation from 'calypso/me/sidebar-navigation';
import ReauthRequired from 'calypso/me/reauth-required';
import SecuritySectionNav from 'calypso/me/security-section-nav';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import FormattedHeader from 'calypso/components/formatted-header';

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
		const { path, translate } = this.props;
		const useCheckupMenu = config.isEnabled( 'security/security-checkup' );

		return (
			<Main className="security is-wide-layout">
				<PageViewTracker path={ path } title="Me > Password" />
				<DocumentHead title={ translate( 'Password' ) } />
				<MeSidebarNavigation />

				<FormattedHeader brandFont headerText={ translate( 'Security' ) } align="left" />

				{ ! useCheckupMenu && <SecuritySectionNav path={ path } /> }
				{ useCheckupMenu && (
					<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
						{ translate( 'Password' ) }
					</HeaderCake>
				) }

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<Card className="me-security-settings security__settings">
					<p>
						{ translate(
							'To update your password enter a new one below. ' +
								'Strong passwords have at least six characters, and use upper and lower case letters, numbers, and symbols like ! ” ? $ % ^ & ).'
						) }
					</p>

					<AccountPassword
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
